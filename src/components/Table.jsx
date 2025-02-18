import { useEffect, useState } from "react";
import Row from "./Row";

const DataTable = ({ data }) => {
  const [tableRows, setTableRows] = useState(data.rows);
  const [initialValues, setInitialValues] = useState({});

  useEffect(() => {
    const extractInitialValues = (items) => {
      const storedValues = {};
      const iterate = (items) => {
        items.forEach((item) => {
          storedValues[item.id] = item.value;
          if (item.children) iterate(item.children);
        });
      };
      iterate(items);
      return storedValues;
    };
    setInitialValues(extractInitialValues(tableRows));
  }, []);

  useEffect(() => {
    const computeSubtotals = (items) => {
      return items.map((item) => {
        if (item.children) {
          const updatedChildren = computeSubtotals(item.children);
          const total = updatedChildren.reduce((acc, child) => acc + child.value, 0);
          return { ...item, children: updatedChildren, value: total };
        }
        return item;
      });
    };
    setTableRows(computeSubtotals(tableRows));
  }, [tableRows]);

  const modifyRow = (id, newVal) => {
    const updateItems = (items) => {
      return items.map((item) => {
        if (item.id === id) {
          if (item.children) {
            const totalChildVal = item.children.reduce((acc, child) => acc + child.value, 0);
            const adjustedChildren = item.children.map((child) => ({
              ...child,
              value: (child.value / totalChildVal) * newVal,
            }));
            return { ...item, value: newVal, children: adjustedChildren };
          }
          return { ...item, value: newVal };
        }
        if (item.children) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };
    setTableRows(updateItems(tableRows));
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Label</th>
          <th>Value</th>
          <th>Input</th>
          <th>Allocation %</th>
          <th>Allocation Val</th>
          <th>Variance %</th>
        </tr>
      </thead>
      <tbody>
        {tableRows.map((item) => (
          <Row
            key={item.id}
            row={item}
            depth={0}
            onUpdate={modifyRow}
            originalValues={initialValues}
          />
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
