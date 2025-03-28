import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZoomIn, ZoomOut, RotateCw, Wand2, Camera, TextSelect, Eraser } from "lucide-react";

interface PDFZoomControlsProps {
  zoom: number;
  currentPage: number;
  totalPages: number;
  inputPage: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onPageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPageChange: (page: number) => void;
  drawingMode: boolean;
  onToggleDrawing: () => void;
  screenshotMode: boolean;
  onToggleScreenshot: () => void;
  onScreenshot: () => void;
  highlightMode?: boolean;
  onToggleHighlight?: () => void;
  eraseMode?: boolean;
  onToggleErase?: () => void;
  debugMode?: boolean;
}

export const PDFZoomControls: React.FC<PDFZoomControlsProps> = ({
  zoom,
  currentPage,
  totalPages,
  inputPage,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPageInputChange,
  onPageChange,
  drawingMode,
  onToggleDrawing,
  screenshotMode,
  onToggleScreenshot,
  onScreenshot,
  highlightMode,
  onToggleHighlight,
  eraseMode,
  onToggleErase,
  debugMode,
}) => {
  // اضافه کردن state برای مدیریت input دستی صفحه
  const [manualPage, setManualPage] = React.useState<string>('');
  const [showPageInput, setShowPageInput] = React.useState<boolean>(false);
  
  // هندلر برای تغییر متن وارد شده
  const handleManualPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // فقط اجازه ورود اعداد
    const value = e.target.value.replace(/[^0-9]/g, '');
    setManualPage(value);
  };
  
  // هندلر برای ثبت صفحه جدید با فشردن Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigateToEnteredPage();
    } else if (e.key === 'Escape') {
      setShowPageInput(false);
    }
  };
  
  // تابع مشترک برای تغییر صفحه
  const navigateToEnteredPage = () => {
    const pageNum = parseInt(manualPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
    setShowPageInput(false);
  };
  
  // هندلر برای وقتی کاربر از input خارج می‌شود
  const handleInputBlur = () => {
    navigateToEnteredPage();
  };
  
  // هندلر برای کلیک بر روی شماره صفحه و باز شدن input
  const handlePageClick = () => {
    setManualPage(currentPage.toString());
    setShowPageInput(true);
  };
  
  return (
    <div className="pt-4 p-2 border-b flex items-center justify-between bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onResetZoom}>
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
          {zoom}%
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleDrawing}
          className={drawingMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
        >
          <Wand2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (screenshotMode) {
              onScreenshot();
            } else {
              onToggleScreenshot();
            }
          }}
          className={screenshotMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
        >
          <Camera className="h-4 w-4" />
        </Button>
        
        {/* دکمه هایلایت */}
        {onToggleHighlight && (
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleHighlight}
            className={highlightMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
          >
            <TextSelect className="h-4 w-4" />
          </Button>
        )}
        
        {/* دکمه پاک کن */}
        {onToggleErase && (
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleErase}
            className={eraseMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
          >
            <Eraser className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* بخش ناوبری صفحات - با امکان ورود دستی شماره صفحه فقط برای عدد سمت چپ */}
      <div className="flex items-center">
        <div className="flex items-center rounded-md border border-input bg-background overflow-hidden">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-none border-r h-9 px-2"
          >
            ‹
          </Button>
          
          <div className="flex items-center justify-center px-2">
            {/* بخش شماره صفحه فعلی - قابل کلیک و ویرایش */}
            <div className="flex items-center">
              {showPageInput ? (
                <input
                  type="text"
                  value={manualPage}
                  onChange={handleManualPageChange}
                  onKeyDown={handleKeyDown}
                  className="w-8 h-7 text-center bg-primary/10 text-primary border border-primary/20 rounded focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                  onBlur={handleInputBlur}
                  maxLength={4}
                />
              ) : (
                <span 
                  className="font-medium text-sm text-primary bg-primary/10 px-2 py-1 rounded min-w-[2rem] text-center cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={handlePageClick}
                >
                  {currentPage}
                </span>
              )}
            </div>
            
            {/* خط جدا کننده */}
            <span className="text-muted-foreground mx-1.5">/</span>
            
            {/* نمایش تعداد کل صفحات - غیر قابل ویرایش */}
            <span className="font-medium text-sm text-muted-foreground">
              {totalPages}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-none border-l h-9 px-2"
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  );
};
