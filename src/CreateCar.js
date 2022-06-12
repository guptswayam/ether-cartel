import React, { useState } from 'react'
import { Row, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';

const CATEGORIES = {
  SEDAN: 0,
  SUV: 1,
  HATCHBACK: 2
}

function CreateCar({showroomInstance, account}) {

  const [name, setName] = useState("");
  const [peices, setPeices] = useState("1");
  const [category, setCategory] = useState(CATEGORIES.SEDAN);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("")
  const navigate = useNavigate();

  const addCar = async (e) => {
    e.preventDefault();
    if(+price === 0) {
      alert("Price can't be zero");
      return;
    }
    await showroomInstance.methods.makeItem(peices, Web3.utils.toWei(price, "ether"), name, description, category).send({from: account});
  }

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <h2 className='mb-4'>Sell Car</h2>
          <Form className="content mx-auto" onSubmit={addCar}>
            <Row className="g-4">
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required={true} type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required={true} type="number" placeholder="Price per piece" min={0} step={0.01} />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required={true} type="text" placeholder="Description" />
              <Form.Control onChange={(e) => setPeices(e.target.value)} size="lg" required={true} type="number" placeholder="Total Pieces" min={1} />
              <Form.Select onChange={(e) => setCategory(e.target.value)}>
                {Object.keys(CATEGORIES).map(el => <option key={el} value={CATEGORIES[el]}>{el}</option>)}
              </Form.Select>
              <div className="d-grid px-0">
                <Button type='submit' variant="primary" size="lg">
                  Sell Car
                </Button>
              </div>
            </Row>
          </Form>
        </main>
      </div>
    </div>
  )
}

export default CreateCar;