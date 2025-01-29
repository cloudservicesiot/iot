require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./db/connect');
const mqttClient = require('./mqtt/mqttClient');
const { Server } = require('socket.io');
const http = require('http');
const Entity = require('./models/entity.model'); // Entity model for DB interaction
const mongodb_Url = process.env.MONGO_URI;
const app = express();
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const entityRoutes = require('./routes/entity.route');
const userRoutes = require('./routes/user');
const deviceRoutes = require('./routes/devices.route');
const automationRoutes = require('./routes/automation.route');
const entityHistoryModel = require('./models/entityHistory.model');
const EntityHistory= require("./routes/history.route");
const AirconditionerRoutes = require("./routes/airConditioner.route")
app.use('/user', userRoutes);
app.use('/device', deviceRoutes);
app.use('/entity', entityRoutes);
app.use('/automation', automationRoutes);
app.use('/energy', EntityHistory);
app.use("/ac", AirconditionerRoutes)


// Start server
const port = process.env.PORT || 5000;
const dbConnectionString = mongodb_Url;

const start = async () => {
    try {
        await connectDB(dbConnectionString);
        console.log('Connected to database');

        const server = http.createServer(app);
        const io = new Server(server, {
            cors: {
                origin: "*", 
            },
        });

        server.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });

        // Fetch all active entities from the database and subscribe to their MQTT topics
        const entities = await Entity.find({ isActive: true });
        entities.forEach((entity) => {
            mqttClient.subscribe(entity.subscribeTopic, (err) => {
                if (err) {
                    console.error(`Failed to subscribe to ${entity.subscribeTopic}:`, err);
                } else {
                    console.log(`Subscribed to topic: ${entity.subscribeTopic}`);
                }
            });
        });

        io.on('connection', async (socket) => {
            console.log('New client connected');
        
            try {
                // Fetch all entities grouped by devices
                const entities = await Entity.find({ isActive: true }).populate('device', 'name');

        
                // Group entities by their associated device
                // const entities = await Entity.find({ isActive: true });


                const groupedEntities = entities.reduce((groups, entity) => {
                    if (!entity.device) {
                        console.warn(`Entity with ID ${entity._id} does not have an associated device`);
                        return groups;
                    }
                
                    const deviceId = entity.device.toString();
                
                    if (!groups[deviceId]) {
                        groups[deviceId] = {
                            deviceId: entity.device._id,
                            deviceName: entity.device.name,
                            // isActive: entity.device.isActive,
                            entities: [],
                        };
                    }
                    groups[deviceId].entities.push({
                        _id: entity._id,
                        entityName: entity.entityName,
                        entityId: entity.entityId,
                        subscribeTopic: entity.subscribeTopic,
                        publishTopic: entity.publishTopic,
                        stateType: entity.stateType,
                        state: entity.state,
                        // history: entity.history,
                    });
                    return groups;
                }, {});
                
        
                // Send grouped entities to the client
                socket.emit('initial_state', { devices: Object.values(groupedEntities) });
        
                console.log('Sent grouped entities to the client',groupedEntities);
            } catch (error) {
                console.error('Error fetching initial state:', error);
            }
        
            // Handle state change requests
            socket.on('state_change', async ({ publishTopic, state }) => {
                try {
                    console.log(`Received state change request for topic: ${publishTopic}, state: ${state}`);
        
                    const entity = await Entity.findOne({ publishTopic });
                    const stateString = typeof state === 'number' ? state.toString() : state;
                    if (entity) {
                        // Publish new state to MQTT topic
                        mqttClient.publish(publishTopic, stateString, (err) => {
                            if (err) {
                                console.error('Failed to publish MQTT message:', err);
                            } else {
                                console.log(`Published new state to topic ${publishTopic}: ${state}`);
                            }
                        });
        
                        // Update the entity state in the database
                    //     entity.state = state;
                    //     entity.updatedAt = new Date();
                    //     await entity.save();
        
                    //    // Broadcast updated state to all clients
                    //     io.emit('state_update', {
                    //         deviceId: entity.device,
                    //         entityId: entity._id,
                    //         state,
                    //     });
                    }
                } catch (error) {
                    console.error('Error handling state change:', error);
                }
            });
        
            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
        
        

        // Listen for MQTT messages and update React clients
        mqttClient.on('message', async (topic, message) => {
            try {
                const entity = await Entity.findOne({ subscribeTopic: topic });
                if (entity) {
                    // Update the entity's state in the database
                    const newState = message.toString();
                    entity.state = newState;
                    entity.updatedAt = new Date();
                    await entity.save();
        
                    console.log(`Updated state for entity ${entity.entityName} (${entity._id}): ${newState}` );
        
                    // Update or create entity history
                    try {
                        const entityId = entity._id; // Fetch the entity's ID
                        const deviceId = entity.device; 
                        let entityHistory = await entityHistoryModel.findOne({ entityId });
        
                        if (entityHistory) {
                            // Push a new history entry
                            entityHistory.history.push({ value: newState, time: new Date() });
                            await entityHistory.save();
                        } else {
                            // Create a new entity history document
                            entityHistory = new entityHistoryModel({
                                entityId: entityId,
                                deviceId: deviceId,
                                history: [{ value: newState, time: new Date() }],
                            });
                            await entityHistory.save();
                        }
        
                        console.log(`Updated history for entity ${entity.entityName} (${entity._id}) with device (${deviceId}).`);
                    } catch (historyError) {
                        console.error('Error updating entity history:', historyError);
                    }
        
                    // Broadcast the updated state to all WebSocket clients
                    io.emit('state_update', {
                        deviceId: entity.device,
                        entityId: entity._id,
                        state: newState,
                    });
                } else {
                    console.warn(`No entity found for topic: ${topic}`);
                }
            } catch (error) {
                console.error('Error handling MQTT message:', error);
            }
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};
start();
