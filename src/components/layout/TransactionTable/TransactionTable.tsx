// src/pages/ManageBooth/TransactionTable.tsx
import React from "react";
import Button from "../../common/Buttom/Buttom";
import "./TransactionTable.css";
import { formatNumber } from "../../../utils/fomat";
import type { TransactionVoid } from "../../../types/transaction";

const TransactionTable: React.FC<{ data: TransactionVoid[] }> = ({ data }) => {
  return (
    <>
      <div className="table-wrapper shadow">
        <table className="transaction-table">
          <thead>
            <tr>
              <th className="id">Tran_ID</th>
              <th className="booth">Booth</th>
              <th className="user">User</th>
              <th className="type">Type</th>
              <th className="amount">Amount</th>
              <th className="action">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td className="id">{item.id}</td>
                <td className="booth">{item.booth}</td>
                <td className="user">{item.user}</td>
                <td
                  className={`type font-bold ${item.type.includes("SALE") ? "text-red" : "text-green"}`}
                >
                  {item.type+' '+item.currency_name} {/* แสดงประเภทพร้อมสกุลเงิน */}
                </td>
                <td className="amount">{formatNumber(item.amount)}</td>
                <td className="action">
                  {/* 🚩 ใช้ Button Component ที่เราทำไว้ โดยส่งขนาดที่เล็กลงผ่าน className หรือ inline style */}
                  <Button label="view" variant="view"  />
                  <Button
                    label="APPROVE"
                    variant="submit"
                  />
                  <Button label="DENY" variant="cancel" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TransactionTable;
