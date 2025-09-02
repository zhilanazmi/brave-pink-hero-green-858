
import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { DropzoneUploader } from "@/components/DropzoneUploader";
import { DuotoneCanvas } from "@/components/DuotoneCanvas";
import { ActionsBar } from "@/components/ActionsBar";
import { ReverseToggle } from "@/components/ReverseToggle";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface ProcessedImage {
  url: string;
  filename: string;
  dimensions: { width: number; height: number };
}

const Index = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  
  // Debounce the reverse toggle to prevent excessive processing
  const [debouncedIsReversed] = useDebounce(isReversed, 200);

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    // Revoke previous processed image URL before setting new file
    setProcessedImage(prev => {
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }
      return null;
    });
    setOriginalFile(file);
    setIsProcessing(true);
  }, []);

  const handleReverseToggle = useCallback((checked: boolean) => {
    setIsReversed(checked);
  }, []);

  const handleProcessingComplete = useCallback((url: string, dimensions: { width: number; height: number }) => {
    setProcessedImage(prev => {
      // Revoke previous URL before setting new one
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }
      
      return originalFile ? {
        url,
        filename: originalFile.name,
        dimensions
      } : null;
    });
    setIsProcessing(false);
  }, [originalFile]);

  const handleProcessingError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsProcessing(false);
  }, []);

  const handleReset = useCallback(() => {
    setProcessedImage(prev => {
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }
      return null;
    });
    setOriginalFile(null);
    setError(null);
    setIsProcessing(false);
    setIsReversed(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setProcessedImage(prev => {
        if (prev?.url) {
          URL.revokeObjectURL(prev.url);
        }
        return null;
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-surface pb-safe relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl relative">
        {/* Header with theme toggle */}
        <header className="text-center mb-6 sm:mb-12 relative">
          <div className="absolute top-0 right-0 sm:top-4 sm:right-4">
            <DarkModeToggle />
          </div>
          
          <div className="animate-float">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary mr-2 animate-pulse" />
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-duotone bg-clip-text text-transparent animate-gradient">
                Brave Pink Hero Green
              </h1>
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-secondary ml-2 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2 mb-2">
            Pink × Green duotone. Local & private.
          </p>
          <p className="text-sm text-muted-foreground px-2">
            Transform your photos with beautiful duotone effects. All processing happens in your browser.
          </p>
        </header>

        {/* Main content */}
        <main className="space-y-4 sm:space-y-8 pb-20 sm:pb-8">
          {!originalFile && !processedImage && (
            <Card className="p-4 sm:p-8 shadow-card mx-2 sm:mx-0 border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-drop animate-glow">
              <DropzoneUploader onFileSelect={handleFileSelect} />
            </Card>
          )}

          {error && (
            <Card className="p-4 sm:p-6 border-destructive bg-destructive/5 mx-2 sm:mx-0 animate-glow">
              <div className="text-center">
                <p className="text-destructive font-medium mb-4">{error}</p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-300 hover:scale-105 min-h-[44px]"
                >
                  Try Again
                </button>
              </div>
            </Card>
          )}

          {originalFile && (
            <>
              <Card className="p-4 sm:p-6 shadow-card mx-2 sm:mx-0 border hover:border-primary/30 transition-all duration-300 hover:shadow-drop">
                <DuotoneCanvas
                  file={originalFile}
                  onProcessingComplete={handleProcessingComplete}
                  onProcessingError={handleProcessingError}
                  isProcessing={isProcessing}
                  isReversed={debouncedIsReversed}
                />
              </Card>
              
              {/* Controls - Mobile optimized */}
              <Card className="p-4 sm:p-6 shadow-card mx-2 sm:mx-0 border hover:border-primary/30 transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="w-full sm:w-auto">
                    <ReverseToggle
                      checked={isReversed}
                      onCheckedChange={handleReverseToggle}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </Card>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-8 sm:mt-16 pt-8 border-t border-border px-2">
          <p className="text-sm text-muted-foreground">
          All processes are in the browser. No data is stored on your device.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            developed by <a 
              href="https://instagram.com/zhilanazmi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors underline"
            >
              Zhillan Azmi
            </a>
          </p>
        </footer>
      </div>

      {/* Sticky bottom bar for mobile */}
      {processedImage && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border pb-safe sm:hidden">
          <div className="p-4 pb-20">
            <ActionsBar
              processedImage={processedImage}
              onReset={handleReset}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {/* Desktop actions */}
      {processedImage && (
        <div className="hidden sm:block">
          <ActionsBar
            processedImage={processedImage}
            onReset={handleReset}
            isMobile={false}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
