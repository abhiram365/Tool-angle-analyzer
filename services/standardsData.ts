
export interface AngleStandard {
    min: number;
    max: number;
    unit: string;
}

export interface ToolStandard {
    material: string;
    angles: {
        [key: string]: AngleStandard;
    };
}

export const ASME_STANDARDS: ToolStandard[] = [
    {
        material: "HSS",
        angles: {
            "Rake Angle": { min: 5, max: 15, unit: "degrees" },
            "Relief Angle": { min: 8, max: 12, unit: "degrees" },
            "Clearance Angle": { min: 10, max: 15, unit: "degrees" },
            "Side Cutting Edge Angle": { min: 15, max: 30, unit: "degrees" },
            "End Cutting Edge Angle": { min: 8, max: 15, unit: "degrees" }
        }
    },
    {
        material: "Carbide",
        angles: {
            "Rake Angle": { min: -5, max: 10, unit: "degrees" },
            "Relief Angle": { min: 5, max: 10, unit: "degrees" },
            "Clearance Angle": { min: 5, max: 10, unit: "degrees" },
            "Side Cutting Edge Angle": { min: 15, max: 45, unit: "degrees" },
            "End Cutting Edge Angle": { min: 5, max: 10, unit: "degrees" }
        }
    }
];

export function getStandardRange(angleName: string, toolMaterial: "HSS" | "Carbide" = "HSS"): string {
    const standard = ASME_STANDARDS.find(s => s.material === toolMaterial);
    const angleStd = standard?.angles[angleName];
    
    if (angleStd) {
        return `${angleStd.min}° - ${angleStd.max}°`;
    }
    return "Not Specified";
}

export function checkCompliance(angleName: string, value: number, toolMaterial: "HSS" | "Carbide" = "HSS"): boolean {
    const standard = ASME_STANDARDS.find(s => s.material === toolMaterial);
    const angleStd = standard?.angles[angleName];

    if (angleStd) {
        return value >= angleStd.min && value <= angleStd.max;
    }
    return true; // Assume compliant if no standard exists
}
