import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap'
import camaroImage from "./assets/camaro.jpg"
import Web3 from 'web3';

const CATEGORIES = {
  0: "SEDAN",
  1: "SUV",
  2: "HATCHBACK"
}

const LIMIT = 4;

function MyCarListing({showroomInstance, carInstance, account}) {

  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [lastItemId, setLastItemId] = useState(0);
  const [itemsCount, setItemsCount] = useState(null);

  const fetchItemsCount = async () => {
    const itemsCount = await showroomInstance.methods.itemCount().call({from: account});
    setItemsCount(itemsCount);
  }

  
  const fetchCars = async () => {
    const carsList = [];
    for(let i=lastItemId + 1;i<=itemsCount;i++) {
      const carAddress = await showroomInstance.methods.items(i).call({from: account});
      carInstance.options.address = carAddress;
      const category = await carInstance.methods.category().call({from: account});
      const price = await carInstance.methods.price().call({from: account});
      const name = await carInstance.methods.name().call({from: account});
      const description = await carInstance.methods.description().call({from: account});
      const carCount = await carInstance.methods.carCount().call({from: account});
      const quantitySold = await carInstance.methods.quantitySold().call({from: account});
      const dealer = await carInstance.methods.dealer().call({from: account});
      if(dealer === account) {
        carsList.push({
          carId: i,
          category,
          price,
          name,
          description,
          carCount,
          quantitySold
        })
      }
      if(carsList.length == LIMIT) {
        setLastItemId(i);
        break;
      }
    }

    if(carsList.length !== LIMIT) {
      setLastItemId(itemsCount);
    }
    
    setCars((prevState) => (prevState.concat(carsList)));
    setLoading(false)
  }

  useEffect(() => {
    if(itemsCount !== null) {
      fetchCars();
    }
  }, [itemsCount])

  useEffect(() => {
    fetchItemsCount();
  }, [])

  const buyCar = async (carId, price) => {
    console.log(carId, price);
    await showroomInstance.methods.purchaseCar(carId).send({from: account, value: price});
  }


  if(loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spinner animation="border" style={{ display: 'flex' }} />
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      {cars.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {cars.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={camaroImage} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>
                      {item.description} - {CATEGORIES[item.category]}
                      <br/> 
                      <b>{item.carCount - item.quantitySold > 0 ? `Only ${item.carCount - item.quantitySold} piece left!` : "No Piece Left!"}</b>
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className='d-grid'>
                      <Button onClick={() => buyCar(item.carId, item.price)} variant="primary" size="lg" disabled={true}>
                        Buy for {Web3.utils.fromWei(item.price, "ether")} ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
          {lastItemId < itemsCount && <Button className='btn btn-dark' onClick={fetchCars}>Load more</Button>}
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed Cars</h2>
          </main>
        )}
    </div>
  )
}

export default MyCarListing;