// extractionService simulates an API for extracting ID data from images.
// In a real application, this would make HTTP requests to a backend service.
// Here, it returns mock data for demo purposes.

// Sample response data structure based on the provided JavaScript code
export interface ExtractionResult {
  success: boolean;
  data: {
    request: Record<string, unknown>;
    response: {
      status: string;
      documentImage?: string;
      classification?: Record<string, string>;
      data?: {
        textField?: Array<{
          type: string;
          value: string;
        }>;
        dateField?: Array<{
          type: string;
          value: string;
          date?: {
            day: number;
            month: number;
            year: number;
          };
        }>;
        sexField?: Array<{
          value: string;
          sex: string;
        }>;
        visualField?: Array<{
          type: string;
          image: string;
        }>;
        mrz?: {
          status: string;
          fields: Record<string, string>;
        };
        pdf417Barcode?: Record<string, string>;
      };
      detection: {
        status: string;
      };
    };
  };
}

// Mock data for demonstration purposes
const mockExtractionResults: Record<string, ExtractionResult> = {
  // Sample for driver's license
  driverlicense: {
    success: true,
    data: {
      request: {
        /* mock request data */
      },
      response: {
        status: "STATUS_OK",
        documentImage: "", // Base64 string would go here
        classification: {
          documentClass: "DOCUMENT_TYPE_DRIVING_LICENSE",
          countryCode: "COUNTRY_PLACEHOLDER",
          documentType: "DOCUMENT_TYPE_ID_CARD",
        },
        data: {
          textField: [
            { type: "TYPE_FULL_NAME", value: "PLACEHOLDER FULLNAME" },
            { type: "TYPE_DOCUMENT_NUMBER", value: "PLACEHOLDER_DOC_NUMBER" },
            { type: "TYPE_ADDRESS", value: "PLACEHOLDER ADDRESS" },
            { type: "TYPE_ISSUING_AUTHORITY", value: "PLACEHOLDER AUTHORITY" },
            { type: "TYPE_NATIONALITY", value: "PLACEHOLDER NATIONALITY" },
          ],
          dateField: [
            {
              type: "TYPE_DATE_OF_BIRTH",
              value: "01/01/1970",
              date: { day: 1, month: 1, year: 1970 },
            },
            {
              type: "TYPE_ISSUE_DATE",
              value: "01/01/2020",
              date: { day: 1, month: 1, year: 2020 },
            },
            {
              type: "TYPE_EXPIRY_DATE",
              value: "01/01/2030",
              date: { day: 1, month: 1, year: 2030 },
            },
          ],
          sexField: [{ value: "X", sex: "UNSPECIFIED" }],
          visualField: [
            // Sample base64 images would go here in a real implementation
          ],
          mrz: {
            status: "STATUS_OK",
            fields: {
              documentNumber: "PLACEHOLDER_DOC_NUMBER",
              dateOfBirth: "700101",
              dateOfExpiry: "300101",
              nationality: "PLACEHOLDER_NATIONALITY",
              sex: "X",
              names: "PLACEHOLDER FULLNAME",
              optional: "<<<<<<<<<<<<<<",
            },
          },
          pdf417Barcode: {
            firstName: "PLACEHOLDER_FIRST",
            lastName: "PLACEHOLDER_LAST",
            streetAddress: "PLACEHOLDER STREET",
            city: "PLACEHOLDER CITY",
            state: "PLACEHOLDER STATE",
            postalCode: "00000",
            licenseNumber: "PLACEHOLDER_DOC_NUMBER",
            issuingCountry: "PLACEHOLDER_COUNTRY",
          },
        },
        detection: {
          status: "STATUS_OK",
        },
      },
    },
  },

  // Sample for passport
  passport: {
    success: true,
    data: {
      request: {
        /* mock request data */
      },
      response: {
        status: "STATUS_OK",
        documentImage: "", // Base64 string would go here
        classification: {
          documentClass: "DOCUMENT_TYPE_PASSPORT",
          countryCode: "COUNTRY_PLACEHOLDER",
          documentType: "DOCUMENT_TYPE_PASSPORT",
        },
        data: {
          textField: [
            { type: "TYPE_FIRST_NAME", value: "PLACEHOLDER_FIRST" },
            { type: "TYPE_LAST_NAME", value: "PLACEHOLDER_LAST" },
            { type: "TYPE_DOCUMENT_NUMBER", value: "PLACEHOLDER_DOC_NUMBER" },
            { type: "TYPE_NATIONALITY", value: "PLACEHOLDER_NATIONALITY" },
            { type: "TYPE_PLACE_OF_BIRTH", value: "PLACEHOLDER_BIRTHPLACE" },
            { type: "TYPE_ISSUING_AUTHORITY", value: "PLACEHOLDER_AUTHORITY" },
          ],
          dateField: [
            {
              type: "TYPE_DATE_OF_BIRTH",
              value: "01 JAN 1970",
              date: { day: 1, month: 1, year: 1970 },
            },
            {
              type: "TYPE_ISSUE_DATE",
              value: "01 JAN 2020",
              date: { day: 1, month: 1, year: 2020 },
            },
            {
              type: "TYPE_EXPIRY_DATE",
              value: "01 JAN 2030",
              date: { day: 1, month: 1, year: 2030 },
            },
          ],
          sexField: [{ value: "X", sex: "UNSPECIFIED" }],
          visualField: [
            // Sample base64 images would go here in a real implementation
          ],
          mrz: {
            status: "STATUS_OK",
            fields: {
              documentCode: "P",
              issuingState: "PLACEHOLDER_COUNTRY",
              documentNumber: "PLACEHOLDER_DOC_NUMBER",
              dateOfBirth: "700101",
              dateOfExpiry: "300101",
              nationality: "PLACEHOLDER_NATIONALITY",
              sex: "X",
              surnames: "PLACEHOLDER_LAST",
              givenNames: "PLACEHOLDER_FIRST",
            },
          },
        },
        detection: {
          status: "STATUS_OK",
        },
      },
    },
  },

  // Sample for ID card
  idcard: {
    success: true,
    data: {
      request: {
        /* mock request data */
      },
      response: {
        status: "STATUS_OK",
        documentImage: "", // Base64 string would go here
        classification: {
          documentClass: "DOCUMENT_TYPE_ID_CARD",
          countryCode: "COUNTRY_PLACEHOLDER",
          documentType: "DOCUMENT_TYPE_ID_CARD",
        },
        data: {
          textField: [
            { type: "TYPE_FIRST_NAME", value: "PLACEHOLDER_FIRST" },
            { type: "TYPE_LAST_NAME", value: "PLACEHOLDER_LAST" },
            { type: "TYPE_DOCUMENT_NUMBER", value: "PLACEHOLDER_DOC_NUMBER" },
            { type: "TYPE_NATIONALITY", value: "PLACEHOLDER_NATIONALITY" },
            { type: "TYPE_PLACE_OF_BIRTH", value: "PLACEHOLDER_BIRTHPLACE" },
            { type: "TYPE_ADDRESS", value: "PLACEHOLDER ADDRESS" },
          ],
          dateField: [
            {
              type: "TYPE_DATE_OF_BIRTH",
              value: "01.01.1970",
              date: { day: 1, month: 1, year: 1970 },
            },
            {
              type: "TYPE_ISSUE_DATE",
              value: "01.01.2020",
              date: { day: 1, month: 1, year: 2020 },
            },
            {
              type: "TYPE_EXPIRY_DATE",
              value: "01.01.2030",
              date: { day: 1, month: 1, year: 2030 },
            },
          ],
          sexField: [{ value: "X", sex: "UNSPECIFIED" }],
          visualField: [
            // Sample base64 images would go here in a real implementation
          ],
          mrz: {
            status: "STATUS_OK",
            fields: {
              documentCode: "ID",
              issuingState: "PLACEHOLDER_COUNTRY",
              documentNumber: "PLACEHOLDER_DOC_NUMBER",
              dateOfBirth: "700101",
              dateOfExpiry: "300101",
              nationality: "PLACEHOLDER_NATIONALITY",
              sex: "X",
              surnames: "PLACEHOLDER_LAST",
              givenNames: "PLACEHOLDER_FIRST",
            },
          },
        },
        detection: {
          status: "STATUS_OK",
        },
      },
    },
  },

  // Sample for error
  error: {
    success: false,
    data: {
      request: {
        /* mock request data */
      },
      response: {
        status: "STATUS_ERROR",
        detection: {
          status: "STATUS_ERROR",
        },
      },
    },
  },
};

// Simulate API call with a delay
export const extractDocumentData = async (
  imageBase64: string
): Promise<ExtractionResult> => {
  return new Promise((resolve, reject) => {
    // Simulate API delay and random result selection for demo
    setTimeout(() => {
      const imageSize = imageBase64.length;

      // Randomly select a result for demo purposes
      const resultKeys = Object.keys(mockExtractionResults).filter(
        (k) => k !== "error"
      );
      const randomIndex = Math.floor(Math.random() * resultKeys.length);
      const selectedKey = resultKeys[randomIndex];

      // Small chance of error to demonstrate error handling
      const shouldError = Math.random() < 0.1; // 10% chance of error

      if (shouldError) {
        resolve(mockExtractionResults["error"]);
      } else {
        resolve(mockExtractionResults[selectedKey]);
      }
    }, 1500); // Simulate a 1.5 second API delay
  });
};
