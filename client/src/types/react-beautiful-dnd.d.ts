declare module 'react-beautiful-dnd' {
  import * as React from 'react';

  export interface DraggableLocation {
    droppableId: string;
    index: number;
  }

  export interface DraggableId {
    droppableId: string;
    index: number;
  }

  export interface DropResult {
    draggableId: string;
    type: string;
    source: DraggableLocation;
    destination?: DraggableLocation;
    reason: 'DROP' | 'CANCEL';
  }

  export interface DroppableProvided {
    innerRef: React.RefObject<HTMLElement>;
    droppableProps: React.HTMLAttributes<HTMLElement>;
    placeholder: React.ReactElement | null;
  }

  export interface DraggableProvided {
    innerRef: React.RefObject<HTMLElement>;
    draggableProps: React.HTMLAttributes<HTMLElement> & {
      style?: React.CSSProperties;
    };
    dragHandleProps: React.HTMLAttributes<HTMLElement> | null;
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean;
    isDropAnimating: boolean;
    draggingOver: string | null;
    dropAnimation: {
      duration: number;
      curve: string;
      moveTo: {
        x: number;
        y: number;
      };
    } | null;
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith: string | null;
    draggingFromThisWith: string | null;
  }

  export interface DragDropContextProps {
    onDragEnd: (result: DropResult) => void;
    onDragStart?: (initial: any) => void;
    onDragUpdate?: (initial: any) => void;
    children: React.ReactNode;
  }

  export interface DroppableProps {
    droppableId: string;
    type?: string;
    ignoreContainerClipping?: boolean;
    isDropDisabled?: boolean;
    isCombineEnabled?: boolean;
    direction?: 'vertical' | 'horizontal';
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactNode;
  }

  export interface DraggableProps {
    draggableId: string;
    index: number;
    isDragDisabled?: boolean;
    disableInteractiveElementBlocking?: boolean;
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactNode;
  }

  export class DragDropContext extends React.Component<DragDropContextProps> {}
  export class Droppable extends React.Component<DroppableProps> {}
  export class Draggable extends React.Component<DraggableProps> {}
}