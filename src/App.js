import React from "react";
import Dealer from "../build/contracts/Dealer.json"
import Showroom from "../build/contracts/Showroom.json"
import Car from "../build/contracts/Car.json"
import "./App.css";
import getWeb3 from "./getWeb3";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./Home";
import DealersList from "./DealersList";
import Navigation from "./Navbar";
import CreateDealer from "./CreateDealer";
import NotFound from "./NotFound";
import CreateCar from "./CreateCar";
import MyPurchases from "./MyPurchases";
import MyCarListing from "./MyCarListing";
import { Spinner } from "react-bootstrap";



class App extends React.Component {
  state = {
    account: null,
    loading: true,
    isOwner: false,
    isDealer: false
  };

  async componentDidMount() {
    this.web3 = await getWeb3();

    // this.accounts = await this.web3.eth.getAccounts();
    // console.log(this.accounts)

    // Get the contract instance.
    this.networkId = await this.web3.eth.net.getId();

    if(this.networkId != 3) {
      alert("Please use the Ropsten Testnet!");
      return;
    }

    this.dealerInstance = new this.web3.eth.Contract(
      Dealer.abi,
      Dealer.networks[this.networkId] && Dealer.networks[this.networkId].address
    )

    this.showroomInstance = new this.web3.eth.Contract(
      Showroom.abi,
      Showroom.networks[this.networkId] && Showroom.networks[this.networkId].address
    )

    this.carInstance = new this.web3.eth.Contract(
      Car.abi
    )

    // console.log(await this.web3.eth.getBlockNumber())
    
    // this.watchEvents();
    this.setState({ loading: false });
  }

  connectToWallet = async () => {
    // await window.ethereum.enable();      // this is deprecated and can be removed in future releases, use requestAccouns instead
    // const accounts = await this.web3.eth.getAccounts();

    const accounts = await this.web3.eth.requestAccounts();
    // console.log(accounts)
    this.setState({account: accounts[0]}, this.isOwner);
  }

  isDealer = async () => {
    const response = await this.dealerInstance.methods.isDealer().call({from: this.state.account});
    // console.log(response)
    if(response)
      this.setState({isDealer: true})
  }

  isOwner = async () => {
    this.isDealer();
    const response = await this.dealerInstance.methods.owner().call({from: this.state.account});
    // console.log(response)
    if(response === this.state.account) {
      this.setState({isOwner: true})
    }
  }

  render() {

    if(this.state.loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <Spinner animation="border" style={{ display: 'flex' }} />
        </div>
      )
    }

    return (
      <BrowserRouter>
        <div className="App">
          <>
            <Navigation isOwner = {this.state.isOwner} isDealer = {this.state.isDealer} account={this.state.account} connectToWallet={this.connectToWallet} />
          </>
          <div>
            <Routes>
              <Route path="/" element={<Home showroomInstance={this.showroomInstance} carInstance={this.carInstance} account={this.state.account} />} />
              {this.state.account && <Route path="/my-purchases" element={<MyPurchases web3={this.web3} showroomInstance={this.showroomInstance} carInstance={this.carInstance} account={this.state.account} />} />}
              { this.state.isOwner && 
                <>
                  <Route path="/dealers/create" element={<CreateDealer dealerInstance={this.dealerInstance} account={this.state.account} />} />
                  <Route path="/dealers" element={<DealersList dealerInstance={this.dealerInstance} account={this.state.account} />} />
                </>
              }
              { this.state.isDealer && 
                <>
                  <Route path="/cars/create" element={<CreateCar showroomInstance={this.showroomInstance} account={this.state.account} />} />
                  <Route path="/cars/mine" element={<MyCarListing showroomInstance={this.showroomInstance} carInstance={this.carInstance} account={this.state.account} />} />
                </>
              }
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;


/*

import React, { useEffect, useRef, useState } from "react";
import Dealer from "../build/contracts/Dealer.json"
import "./App.css";
import getWeb3 from "./getWeb3";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./Home";
import DealersList from "./DealersList";
import Navigation from "./Navbar";
import CreateDealer from "./CreateDealer";
import NotFound from "./NotFound";



function App() {

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false)
  const [isDealer, setIsDealer] = useState(false)

  const dealerInstance = useRef(null);
  const web3 = useRef(null);
  const networkId = useRef(null);

  const instantiateContracts = async () => {
    web3.current = await getWeb3();

    // accounts = await web3.eth.getAccounts();
    // console.log(accounts)

    // Get the contract instance.
    networkId.current = await web3.current.eth.net.getId();
    dealerInstance.current = new web3.current.eth.Contract(
      Dealer.abi,
      Dealer.networks[networkId.current] && Dealer.networks[networkId.current].address
    )

    // watchEvents();
    setLoading(false);
  }

  useEffect(() => {
    instantiateContracts();
  }, []);

  const connectToWallet = async () => {
    // await window.ethereum.enable();      // this is deprecated and can be removed in future releases, use requestAccouns instead
    // const accounts = await web3.current.eth.getAccounts();

    const accounts = await web3.current.eth.requestAccounts();
    console.log(accounts)
    setAccount(accounts[0]);
  }

  const checkDealer = async () => {
    const response = await dealerInstance.current.methods.isDealer().call({from: account});
    console.log(response)
    if(response)
      setIsDealer(true)
  }

  const checkOwner = async () => {
    const response = await dealerInstance.current.methods.owner().call({from: account});
    console.log(response)
    if(response === account) {
      setIsOwner(true)
    }
  }

  useEffect(() => {
    if(account) {
      checkOwner();
      checkDealer();
    }
  }, [account])

  return (
    <BrowserRouter>
      <div className="App">
        <>
          <Navigation isOwner = {isOwner} isDealer = {isDealer} account={account} connectToWallet={connectToWallet} />
        </>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            { isOwner && 
              <>
                <Route path="/dealers/create" element={<CreateDealer dealerInstance={dealerInstance.current} account={account} />} />
                <Route path="/dealers" element={<DealersList dealerInstance={dealerInstance.current} account={account} />} />
              </>
            }
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );

}

export default App;


*/