import pandas as pd
from docx import Document

# Data for the updated schedule
data_updated = {
    "Date": [
        "Jan 1 – Jan 16", "Jan 17", "Jan 18", "Jan 19", "Jan 20",
        "Jan 21", "Jan 22", "Jan 23", "Jan 24", "Jan 25",
        "Jan 26", "Jan 27", "Jan 28", "Jan 29", "Jan 30",
        "Jan 31"
    ],
    "Day": [
        "Leave", "Wednesday", "Thursday", "Friday", "Saturday",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday", "Monday", "Tuesday",
        "Wednesday"
    ],
    "Hours Worked": [
        0, 8, 8, 8, 0,
        0, 8, 8, 8, 8,
        8, 0, 0, 8, 8,
        8
    ],
    "Notes": [
        "Exams", "Extra 4 hours", "Extra 4 hours", "Extra 4 hours", "Weekend",
        "Weekend", "Extra 4 hours", "Extra 4 hours", "Extra 4 hours", "Extra 4 hours",
        "Extra 4 hours", "Weekend", "Weekend", "Extra 4 hours", "Extra 4 hours",
        "Extra 4 hours"
    ]
}

# Create updated DataFrame
df_updated = pd.DataFrame(data_updated)

# Calculate Total Hours
total_hours_updated = df_updated["Hours Worked"].sum()
df_updated.loc[len(df_updated.index)] = ["Total Hours", "", total_hours_updated, "Goal Achieved"]

# Save updated schedule to Excel
excel_path_updated = "/Updated_January_Work_Schedule.xlsx"
with pd.ExcelWriter(excel_path_updated, engine='xlsxwriter') as writer:
    df_updated.to_excel(writer, sheet_name='Schedule', index=False)

    # Access the workbook and worksheet
    workbook  = writer.book
    worksheet = writer.sheets['Schedule']

    # Add a summary at the end
    summary_note = """
    Summary:
    - Leave from January 1st to January 16th (Exams).
    - Work resumes from January 17th to January 31st.
    - Working hours: 8 hours/day with extra 4 hours to compensate for part-time work.
    - Saturdays and Sundays are off.
    """
    worksheet.write(len(df_updated) + 2, 0, summary_note)

excel_path_updated
