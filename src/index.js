import {createRoot} from "react-dom/client";
import 'bootstrap/dist/css/bootstrap.css'
import App from "./App";

if(window.ethereum){
  // window.ethereum.on("accountsChanged", function (accounts) {
  //   console.log(true);
  //   window.location.reload(true);
  // })

  window.ethereum.on('chainChanged', function (networkId) {
    window.location.reload(true);
  })
}

const app = document.getElementById("root");
const root = createRoot(app)
root.render(<App />);