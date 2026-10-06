// Task-related types are shared with the dashboard feature — re-exported here
// so components under `features/tasks/` can import from a single local module.
export type {
  AuditLog,
  Comment,
  Subtask,
  Task,
  TaskMuhimlik,
  TaskStatus,
  TaskStatusColor,
  UserRef,
} from '../dashboard/types'
