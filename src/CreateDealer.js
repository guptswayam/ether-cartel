import React, { useState } from 'react'
import { Row, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';

function CreateDealer({dealerInstance, account}) {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const navigate = useNavigate();

  const createDealer = async (e) => {
    e.preventDefault();
    try {
      await dealerInstance.methods.registerDealer(name, phone, address).send({from: account});
    } catch (error) {
      // console.log(error.reason, error.code, error.argument, error.value);
      console.log(error);
      alert(error.code + " " +  error.argument + ": " + error.value);
    }
  }

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <h2 className='mb-4'>Register Dealer</h2>
          <Form className="content mx-auto" onSubmit={createDealer}>
            <Row className="g-4">
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required={true} type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setPhone(e.target.value)} size="lg" required={true} type="text" placeholder="Mobile Number" />
              <Form.Control onChange={(e) => setAddress(e.target.value)} size="lg" required={true} type="text" placeholder="Wallet Address" />
              <div className="d-grid px-0">
                <Button type='submit' variant="primary" size="lg">
                  Register Dealer
                </Button>
              </div>
            </Row>
          </Form>
        </main>
      </div>
    </div>
  )
}

export default CreateDealer;