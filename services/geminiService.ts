
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';
import { getStandardRange, checkCompliance } from './standardsData';

// Assume API key is set in environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const analysisSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      angleName: { type: Type.STRING, description: "Name of the measured angle (e.g., Rake Angle, Relief Angle)" },
      measuredValue: { type: Type.NUMBER, description: "The measured value in degrees" },
      coordinates: {
        type: Type.OBJECT,
        properties: {
          vertex: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } },
          point1: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } },
          point2: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } }
        },
        description: "Pixel coordinates for visualizing the angle on the image (1000x1000 reference space)."
      },
      confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"], description: "Confidence level of the measurement" }
    },
    required: ["angleName", "measuredValue", "coordinates", "confidence"]
  }
};

export async function analyzeToolImage(base64Image: string): Promise<AnalysisResult[]> {
  // Default to HSS for initial analysis. In a real app, user would select material beforehand.
  const defaultMaterial = "HSS"; 

  const prompt = `
    Analyze this image of a single-point cutting tool. 
    Identify the following key geometries: Rake Angle, Relief Angle, Clearance Angle, and Side Cutting Edge Angle.
    
    For each angle:
    1. Estimate the value in degrees.
    2. Provide pixel coordinates (relative to a 1000x1000 image) to visualize the vertex and the two legs of the angle.
    3. Provide confidence level.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
       throw new Error("Empty response from AI");
    }
    
    const rawResults = JSON.parse(jsonText);

    // Post-process with external compliance data
    const processedResults: AnalysisResult[] = rawResults.map((res: any) => {
        const standardRange = getStandardRange(res.angleName, defaultMaterial);
        const compliant = checkCompliance(res.angleName, res.measuredValue, defaultMaterial);
        
        let recommendation = "";
        if (!compliant) {
            if (res.measuredValue < parseFloat(standardRange.split('-')[0])) {
                recommendation = `Value is below standard (${standardRange}). Consider increasing the angle.`;
            } else {
                recommendation = `Value is above standard (${standardRange}). Consider decreasing the angle.`;
            }
        }

        return {
            angleName: res.angleName,
            measuredValue: res.measuredValue,
            originalValue: res.measuredValue,
            standard: standardRange,
            isCompliant: compliant,
            recommendation: recommendation,
            coordinates: res.coordinates,
            confidence: res.confidence
        };
    });

    return processedResults;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
}

export async function getDesignRecommendations(
  results: AnalysisResult[],
  material: string,
  outcome: string,
  hardness: string,
  ductility: string,
  thermalConductivity: string
): Promise<string> {
  const analysisSummary = results.map(r => 
      `${r.angleName}: ${r.measuredValue}° (${r.isCompliant ? 'Compliant' : 'Non-Compliant'})`
  ).join('\n');

  const prompt = `
    You are an expert manufacturing engineer.
    Based on the following tool geometry analysis and material properties, provide specific design recommendations to achieve the desired machining outcome.
    
    Tool Analysis:
    ${analysisSummary}
    
    Workpiece Material: ${material}
    Target Outcome: ${outcome}
    
    Material Properties:
    ${hardness ? `- Hardness: ${hardness}` : ''}
    ${ductility ? `- Ductility: ${ductility}` : ''}
    ${thermalConductivity ? `- Thermal Conductivity: ${thermalConductivity}` : ''}
    
    Please provide a detailed technical recommendation in Markdown format, including:
    1. Analysis of the current geometry's suitability.
    2. Specific recommendations for Rake, Relief, or other angle adjustments.
    3. Explanation of the physical reasoning (e.g. heat dissipation, chip formation).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return response.text || "No recommendations available.";
  } catch (error) {
    console.error("Error generating design recommendations:", error);
    throw new Error("Failed to generate recommendations.");
  }
}
