import { FunctionDeclaration, Type } from "@google/genai";

// Define the capabilities of our "Digital Employee"
export const DIGITAL_EMPLOYEE_TOOLS: FunctionDeclaration[] = [
  {
    name: 'create_ticket',
    description: 'Create a new support ticket or task in the project management system.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: 'The title of the ticket or task.'
        },
        priority: {
          type: Type.STRING,
          description: 'Priority level: Low, Medium, High, or Critical.',
          enum: ['Low', 'Medium', 'High', 'Critical']
        },
        assignee: {
          type: Type.STRING,
          description: 'Name of the person to assign this to (optional).'
        }
      },
      required: ['title', 'priority']
    }
  },
  {
    name: 'schedule_meeting',
    description: 'Schedule a meeting on the calendar.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        topic: {
          type: Type.STRING,
          description: 'The subject or topic of the meeting.'
        },
        participants: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'List of email addresses or names of participants.'
        },
        time: {
          type: Type.STRING,
          description: 'Proposed time for the meeting (e.g., "Tomorrow at 2pm").'
        }
      },
      required: ['topic', 'time']
    }
  },
  {
    name: 'query_sales_data',
    description: 'Query the internal database for sales performance data.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        region: {
          type: Type.STRING,
          description: 'Sales region (e.g., "North America", "APAC").'
        },
        metric: {
          type: Type.STRING,
          description: 'Metric to query (e.g., "Revenue", "Units Sold").'
        },
        period: {
          type: Type.STRING,
          description: 'Time period (e.g., "Q1 2024", "Last Month").'
        }
      },
      required: ['region', 'metric']
    }
  }
];
