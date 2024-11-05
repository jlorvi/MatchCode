import * as FileSystem from 'expo-file-system';

export const submitToCompilerAPI = async ({ fileUri, language }) => {
  try {
    // Read the file content
    const fileContent = await FileSystem.readAsStringAsync(fileUri);

    // Define the request payload
    const payload = {
      code: fileContent,
      language: language,
      // You might include additional options like input data or time limits here, depending on the API
    };

    // Make the request to the compiler API
    const response = await fetch("YOUR_COMPILER_API_URL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer YOUR_API_KEY`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.output) {
      return {
        success: true,
        output: data.output, // Capture the output from the API response
      };
    } else {
      throw new Error(data.message || "Compilation failed");
    }
  } catch (error) {
    console.error("Error compiling code:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
};
