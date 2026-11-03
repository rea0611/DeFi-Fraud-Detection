
const transactions = [
  {
    hash: "0x7a91...e42f",
    wallet: "0x12ab...89cd",
    amount: "2.45 ETH",
    status: "Normal",
    risk: "Low"
  },
  {
    hash: "0x8b32...a91d",
    wallet: "0x45cd...12ef",
    amount: "8.20 ETH",
    status: "Suspicious",
    risk: "High"
  },
  {
    hash: "0x9c12...b72e",
    wallet: "0x89ef...45ab",
    amount: "1.15 ETH",
    status: "Normal",
    risk: "Low"
  },
  {
    hash: "0x4d52...c83a",
    wallet: "0x34ab...67cd",
    amount: "5.80 ETH",
    status: "Review",
    risk: "Medium"
  }
];

export default function TransactionTable() {
  return (
    <div className="table-card">
      <div className="section-heading">
        <div>
          <h3>Recent Transactions</h3>
          <p>Latest blockchain activities</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Transaction Hash</th>
              <th>Wallet Address</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Risk</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.hash}>
                <td className="hash">{tx.hash}</td>
                <td>{tx.wallet}</td>
                <td>{tx.amount}</td>
                <td>
                  <span className={`status ${tx.status.toLowerCase()}`}>
                    {tx.status}
                  </span>
                </td>
                <td>
                  <span className={`risk ${tx.risk.toLowerCase()}`}>
                    {tx.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
