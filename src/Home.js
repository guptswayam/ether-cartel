import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Button, Spinner, Form } from 'react-bootstrap'
import camaroImage from "./assets/camaro.jpg";
import Web3 from 'web3';
import {promisify} from "util"

const sleep = promisify(setTimeout)

const CATEGORIES = {
  0: "SEDAN",
  1: "SUV",
  2: "HATCHBACK"
}

const LIMIT = 3;

function Home({showroomInstance, carInstance, account}) {

  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [lastItemId, setLastItemId] = useState(0);
  const [itemsCount, setItemsCount] = useState(null);
  const [search, setSearch] = useState("");
  const [disabled, setDisabled] = useState();

  const fetchItemsCount = async () => {
    // account can be null if the user didn't connect to a wallet, but we should always pass the from property in call fn to avoid header not found error, https://github.com/88mphapp/ng88mph-frontend/issues/55
    // Restart the browser if this header not found still there.
    // Other workaround for this error is to add 100ms delay b/w the requests made to blockchain, https://github.com/MetaMask/metamask-extension/issues/7234
    // [IMP] Update the metamask if update is available
    const itemsCount = await showroomInstance.methods.itemCount().call({from: account});
    // console.log(itemsCount);
    setItemsCount(itemsCount);
  }

  const searchCars = async () => {
    setLoading(true);

    // Dynamic values like string are stored as keccak hash in event logs chain
    const hash = Web3.utils.sha3(search);

    // we can either use getPastEvents or getPastLogs for event filtering, https://ethereum.stackexchange.com/questions/87947/how-to-use-topics-as-an-argument-in-getpastevents

    // getPastEvents(): https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#getpastevents, https://ethereum.stackexchange.com/questions/11866/web3-how-do-i-get-past-events-of-mycontract-myevent
    const data = await showroomInstance.getPastEvents("CarListed", {
      topics: [null, null, null, hash],      // first null for eventname keccak hash, second for indexed _from, third for indexed _category in CarListed event, https://stackoverflow.com/questions/57523392/how-to-filter-by-string-parameter-web3-2-0-0-alpha-1-solidity-events
      fromBlock: 0,
      toBlock: "latest"
    })

    // const data = await this.web3.eth.getPastLogs({
    //   address: showroomInstance.options.address,
    //   topics: [this.web3.utils.sha3("CarListed(address,uint256,uint8,string,uint256)"), null, null, this.web3.utils.sha3(search)],
    //   fromBlock: 0,
    //   toBlock: "latest"
    // })

    // console.log(data);
    
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
        quantitySold,
        image: camaroImage
      }
    }))
    
    setLastItemId(itemsCount);
    setCars(cars)
    setLoading(false)
  }

  
  const fetchCars = async (lastItemId) => {
    setDisabled(true);
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
      if(carCount - quantitySold > 0) {
        carsList.push({
          carId: i,
          category,
          price,
          name,
          description,
          carCount,
          quantitySold,
          image: camaroImage
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
    setDisabled(false)
    setLoading(false)
  }

  useEffect(() => {
    if(itemsCount !== null) {
      fetchCars(lastItemId);
    }
  }, [itemsCount])

  useEffect(() => {
    fetchItemsCount();
  }, [])

  const buyCar = async (carId, price) => {
    await showroomInstance.methods.purchaseCar(carId).send({from: account, value: price});
  }

  useEffect(() => {
    if(account)
      watchEvents();
  }, [account])

  const watchEvents = async () => {
    showroomInstance.events.CarSold({_to: account}).on("data", (e) => {
      alert("Car Purchase Successful, Please check My Puchases section!");
    })
  }


  if(loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spinner animation="border" style={{ display: 'flex' }} />
      </div>
    )
  }

  const onSearch = (e) => {
    e.preventDefault();
    
    if(!search) {
      setCars([]);
      setLoading(true);
      fetchCars(0);
      return;
    }
    searchCars();
  }

  return (
    <div className="flex justify-center">
       <div className='m-3 mb-0'>
            <Form style={{display: "flex", justifyContent: "flex-end"}} onSubmit={onSearch}>
              <Form.Control
                type="search"
                placeholder="Search By Name"
                className="me-2"
                aria-label="Search"
                style={{maxWidth: "250px"}}
                onChange={(e) => {setSearch(e.target.value)}}
                value={search}
              />
              <Button variant="outline-dark" type='submit'>Search</Button>
            </Form>
          </div>
      {cars.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {cars.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>
                      {item.description} - {CATEGORIES[item.category]}
                      <br/> 
                      <b>Only {item.carCount - item.quantitySold} piece left!</b>
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className='d-grid'>
                      <Button onClick={() => buyCar(item.carId, item.price)} variant="primary" size="lg" disabled={!account}>
                        Buy for {Web3.utils.fromWei(item.price, "ether")} ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
          {lastItemId < itemsCount && <Button className='btn btn-dark' onClick={() => {fetchCars(lastItemId)}} disabled={disabled}>Load more</Button>}
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed Cars</h2>
          </main>
        )}
    </div>
  )
}

export default Home;