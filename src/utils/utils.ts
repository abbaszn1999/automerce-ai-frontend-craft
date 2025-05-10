
import { toast } from "@/components/ui/sonner";

/**
 * Simulates file upload validation
 * @param file The file to validate
 * @param acceptedTypes Array of accepted file extensions (e.g., ['.csv', '.xlsx'])
 */
export const validateFile = (file: File | null, acceptedTypes: string[]): boolean => {
  if (!file) {
    toast.error("Please select a file to upload.");
    return false;
  }

  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  
  if (!acceptedTypes.includes(fileExtension)) {
    toast.error(`Invalid file type. Please upload ${acceptedTypes.join(', ')} files only.`);
    return false;
  }
  
  return true;
};

/**
 * Copies text to clipboard
 * @param text The text to copy
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
    return true;
  } catch (err) {
    toast.error("Failed to copy to clipboard");
    return false;
  }
};

/**
 * Generates a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Formats a date to a readable string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Simulates processing with progress updates
 */
export const simulateProcessing = (
  onProgress: (progress: number) => void,
  onLog: (message: string) => void,
  onComplete: () => void,
  duration: number = 5000,
  stages?: string[]
): { stop: () => void, pause: () => void, resume: () => void } => {
  let startTime = Date.now();
  let endTime = startTime + duration;
  let stopped = false;
  let paused = false;
  let pausedTime = 0;
  let interval: NodeJS.Timeout;
  let currentStageIndex = 0;
  
  const logs = [
    "Initializing process...",
    "Loading configuration...",
    "Connecting to API...",
    "Preparing dataset...",
    "Processing data batch 1/5...",
    "Running AI analysis...",
    "Processing data batch 2/5...",
    "Optimizing results...",
    "Processing data batch 3/5...",
    "Validating output...",
    "Processing data batch 4/5...",
    "Finalizing results...",
    "Processing data batch 5/5...",
    "Generating report...",
    "Process completed successfully!"
  ];
  
  const updateProgress = () => {
    if (stopped) return;
    if (paused) return;
    
    const now = Date.now();
    const elapsed = now - startTime - pausedTime;
    const total = endTime - startTime;
    
    const progress = Math.min(Math.floor((elapsed / total) * 100), 100);
    
    // Log messages
    if (progress % 7 === 0 || progress === 100) {
      const logIndex = Math.min(Math.floor(progress / 7), logs.length - 1);
      onLog(logs[logIndex]);
    }
    
    // Update stages if provided
    if (stages && stages.length > 0) {
      const newStageIndex = Math.min(Math.floor(progress / (100 / stages.length)), stages.length - 1);
      if (newStageIndex !== currentStageIndex) {
        currentStageIndex = newStageIndex;
        onLog(`Starting stage: ${stages[currentStageIndex]}`);
      }
    }
    
    onProgress(progress);
    
    if (progress === 100) {
      onLog("Process completed successfully!");
      onComplete();
      clearInterval(interval);
    }
  };
  
  interval = setInterval(updateProgress, 100);
  
  // Log initial message
  onLog("Process started");
  
  return {
    stop: () => {
      stopped = true;
      clearInterval(interval);
      onLog("Process stopped");
    },
    pause: () => {
      if (!paused) {
        paused = true;
        pausedTime -= Date.now();
        onLog("Process paused");
      }
    },
    resume: () => {
      if (paused) {
        paused = false;
        pausedTime += Date.now();
        onLog("Process resumed");
      }
    }
  };
};
