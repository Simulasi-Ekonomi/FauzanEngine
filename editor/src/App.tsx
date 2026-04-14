import React from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { MenuBar } from './components/Layout/MenuBar';
import { Toolbar } from './components/Toolbar/Toolbar';
import { Viewport } from './components/Viewport/Viewport';
import { Outliner } from './components/Outliner/Outliner';
import { Properties } from './components/Properties/Properties';
import { ContentBrowser } from './components/ContentBrowser/ContentBrowser';
import { AIConsole } from './components/AIConsole/AIConsole';
import { StatusBar } from './components/StatusBar/StatusBar';

export function App() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <MenuBar />
      <Toolbar />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PanelGroup direction="horizontal" style={{ height: '100%' }}>
          {/* Left: Outliner */}
          <Panel defaultSize={15} minSize={10} maxSize={30}>
            <Outliner />
          </Panel>
          <PanelResizeHandle style={{ width: 2, background: '#1a1a1a', cursor: 'col-resize' }} />
          
          {/* Center: Viewport + Bottom panels */}
          <Panel defaultSize={55} minSize={30}>
            <PanelGroup direction="vertical" style={{ height: '100%' }}>
              {/* Viewport */}
              <Panel defaultSize={65} minSize={30}>
                <Viewport />
              </Panel>
              <PanelResizeHandle style={{ height: 2, background: '#1a1a1a', cursor: 'row-resize' }} />
              
              {/* Bottom: Content Browser + AI Console */}
              <Panel defaultSize={35} minSize={15}>
                <PanelGroup direction="horizontal" style={{ height: '100%' }}>
                  <Panel defaultSize={60} minSize={20}>
                    <ContentBrowser />
                  </Panel>
                  <PanelResizeHandle style={{ width: 2, background: '#1a1a1a', cursor: 'col-resize' }} />
                  <Panel defaultSize={40} minSize={20}>
                    <AIConsole />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle style={{ width: 2, background: '#1a1a1a', cursor: 'col-resize' }} />
          
          {/* Right: Properties/Details */}
          <Panel defaultSize={20} minSize={12} maxSize={35}>
            <Properties />
          </Panel>
        </PanelGroup>
      </div>
      <StatusBar />
    </div>
  );
}
