import React, { useEffect, useRef, useState } from 'react'
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap'
import Web3 from 'web3';
import camaroImage from "./assets/camaro.jpg"
import getWeb3 from './getWeb3';

const LIMIT = 5;
const BLOCKSLIMIT = 10000;
const SHOWROOM_CONTRACT_BLOCK_NUMBER = 12375827;      // All the events that registered in Showroom Contract will be occured after the contract is deployed

const CATEGORIES = {
  0: "SEDAN",
  1: "SUV",
  2: "HATCHBACK"
}

function MyPurchases({showroomInstance, carInstance, account, web3}) {
  const [loading, setLoading] = useState(true);
  const [myCars, setMyCars] = useState([]);
  const latestBlock = useRef(null);
  const fromBlock = useRef(null);
  const toBlock = useRef(null);

  const fetchEvents = async (from, to) => {
    const data = await showroomInstance.getPastEvents("CarSold", {
      filter: {
        _to: account
      },
      fromBlock: latestBlock.current - to < 0 ? 0 : latestBlock.current - to,
      toBlock: latestBlock.current - from
    });

    console.log({
      fromBlock: latestBlock.current - to,
      toBlock: latestBlock.current - from,
      data: data
    })

    return data.reverse();
  }

  const fetchCars = async () => {


    let data = [];
    while(data.length < LIMIT && toBlock.current <= latestBlock.current - SHOWROOM_CONTRACT_BLOCK_NUMBER) {
      if(fromBlock.current == null)
        fromBlock.current = 0
      else {
        fromBlock.current = toBlock.current + 1;
      }

      toBlock.current = fromBlock.current + BLOCKSLIMIT;
      data = data.concat(await fetchEvents(fromBlock.current, toBlock.current))
    }
    

    const cars = await Promise.all(data.map(async el => {
      const carAddress = await showroomInstance.methods.items(el.returnValues._itemId).call({from: account});
      const car = carInstance.clone();
      car.options.address = carAddress;
      const category = await car.methods.category().call({from: account});
      const price = await car.methods.price().call({from: account});
      const name = await car.methods.name().call({from: account});
      const description = await car.methods.description().call({from: account});
      const carCount = await car.methods.carCount().call({from: account});
      const quantitySold = await car.methods.quantitySold().call({from: account});

      return {
        category,
        price,
        name,
        description,
        carCount,
        quantitySold
      }
    }))
    

    setMyCars((prev) => (prev.concat(cars)))
    setLoading(false)
  }

  const mountComponent = async () => {
    latestBlock.current = await web3.eth.getBlockNumber();
    fetchCars();
  }

  useEffect(() => {
    mountComponent();
  }, [])


  if(loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spinner animation="border" style={{ display: 'flex' }} />
      </div>
    )
  }

  const showMore = () => {
    fetchCars();
  }

  return (
    <div className="flex justify-center">
      {myCars.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {myCars.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={camaroImage} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>
                      {item.description} - {CATEGORIES[item.category]}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className='d-grid'>
                      <Button onClick={() => {}} variant="primary" size="lg" disabled={true}>
                        {Web3.utils.fromWei(item.price, "ether")} ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
          {toBlock.current < latestBlock.current - SHOWROOM_CONTRACT_BLOCK_NUMBER && <Button className='btn btn-dark' onClick={showMore}>Load more</Button>}
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No purchased Cars</h2>
          </main>
        )}
    </div>
  )
}

export default MyPurchases;
