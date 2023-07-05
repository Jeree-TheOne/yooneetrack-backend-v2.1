export default interface Comment {
  id: string;
  text: string;
  createdAt: Date;
  userId: string;
  type: 'comment'
}