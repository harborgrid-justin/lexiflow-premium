// Piecewise Constant Approximation for Time-Series Compression
interface TimePoint {
    time: number;
    value: number;
}

export class PiecewiseConstant {
    static compress(data: TimePoint[], threshold: number): TimePoint[] {
        if (data.length <= 1) return data;

        const compressed: TimePoint[] = [data[0]];
        let lastPoint = data[0];

        for (let i = 1; i < data.length; i++) {
            const currentPoint = data[i];
            if (Math.abs(currentPoint.value - lastPoint.value) > threshold) {
                // Add the point just before the change, then the new point
                if (i > 0 && compressed[compressed.length-1].time !== data[i-1].time) {
                    compressed.push(data[i-1]);
                }
                compressed.push(currentPoint);
                lastPoint = currentPoint;
            }
        }
        // Always add the last point
        if(compressed[compressed.length-1].time !== data[data.length-1].time) {
            compressed.push(data[data.length-1]);
        }
        return compressed;
    }
}
