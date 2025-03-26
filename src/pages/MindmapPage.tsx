import React, { useState, ChangeEvent } from 'react';
import { Node, Edge } from 'reactflow';
import MindMap from '../components/mindmap/MindMap';
import ModernHeader from '../components/mindmap/ModernHeader';
import { generateMermaidCode, mermaidToReactflow, extractTextFromImage } from '../services/geminiService';
import '../components/mindmap/MindMapPage.css';

const MindmapPage: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [error, setError] = useState<string>('');
  const [isInputExpanded, setIsInputExpanded] = useState<boolean>(false);

  const handleGenerate = async (): Promise<void> => {
    try {
      const mermaidCode = await generateMermaidCode(inputText);
      const { nodes: newNodes, edges: newEdges } = mermaidToReactflow(mermaidCode);
      
      setNodes(newNodes);
      setEdges(newEdges);
      setError('');
      setIsInputExpanded(false);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const extractedText = await extractTextFromImage(file);
        setInputText(extractedText);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    }
  };

  return (
    <div className="mindmap-page">
      <ModernHeader />
      <div className="mindmap-container">
        <div className={`input-section ${isInputExpanded ? 'expanded' : ''}`}>
          <button 
            className="toggle-button"
            onClick={() => setIsInputExpanded(!isInputExpanded)}
          >
            {isInputExpanded ? '▼ پنهان کردن' : '▲ نمایش ورودی'}
          </button>
          <div className="content">
            <div className="file-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <label 
                htmlFor="image-upload"
                className="paperclip-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </label>
            </div>
            <textarea
              value={inputText}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
              placeholder="متن خود را اینجا وارد کنید..."
            />
            <button onClick={handleGenerate}>تولید نمودار</button>
            {error && <div className="error">{error}</div>}
          </div>
        </div>
        <MindMap nodes={nodes} edges={edges} />
      </div>
    </div>
  );
};

export default MindmapPage;