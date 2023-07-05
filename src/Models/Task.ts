
export default interface Task {
  id: string;
  title: string;
  description: string;
  initialAssessment: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  updaterId: string;
  performerId: string;
  rowId: string;
  columnId: string;
  taskTypeId: string;
  deskId: string;
  spentTime: number;
  tags: string[];
  files: string[];
}