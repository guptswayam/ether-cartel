import React, { useEffect, useState } from "react";
import { Spinner, Table } from "react-bootstrap";

function DealersList({ dealerInstance, account }) {

  const [loading, setLoading] = useState(true)
  const [dealers, setDealers] = useState([]);

  const fetchDealers = async () => {
    const dealerList = await dealerInstance.methods.getDealers(0, 100).call({from: account});
    // console.log(dealerList)
    setDealers(dealerList)
    setLoading(false);
  }

  useEffect(() => {
    fetchDealers();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Spinner animation="border" style={{ display: 'flex' }} />
    </div>
  )

  return (
    <div className="m-5">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Mobile Number</th>
            <th>Address</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {dealers.map((dealer, i) => {
            return (
              <tr key={dealer.dealerAddress}>
                <td>{i + 1}</td>
                <td>{dealer.name}</td>
                <td>{dealer.phone}</td>
                <td>{dealer.dealerAddress}</td>
                <td>{dealer.isActive.toString()}</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default DealersList;
