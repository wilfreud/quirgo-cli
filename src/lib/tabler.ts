import Table from "cli-table3";

export const tabler = new Table({
  head: ["Key", "Value", "Status"],
});

export const addRow = (key: string, value: string, status: boolean) => {
  tabler.push([key, value, status]);
};

export const displayTable = () => {
  console.log(tabler.toString());
};
