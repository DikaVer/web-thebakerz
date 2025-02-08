

export type ColumnsKey =
  | "userID"
  | "userInfo"
  | "userRole"
  | "startDate"
  | "actions";

export const INITIAL_VISIBLE_COLUMNS: ColumnsKey[] = [
  "userID",
  "userInfo",
  "userRole",
  "startDate",
  "actions"
];

export const columns = [
  {name: "User ID", uid: "userID"},
  {name: "User", uid: "userInfo", sortDirection: "ascending"},
  {name: "Role", uid: "userRole"},
  {name: "Start Date", uid: "startDate", info: "The date the user registered"},
  {name: "Actions", uid: "actions"}
];
