import React, { useEffect, Fragment } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HomePage from "./pages/homepage";
import AddProdPage from "./pages/addprod";
import { useWatchlist } from "./providers/watchlistProvider";
import { useAuth } from "./providers/authProvider";
import Loader from "./components/simple_loader";
import QuickPay from "./components/quick-pay";
import { useProducts } from "./providers/productProvider";

function App() {
  const { user } = useAuth();
  const { getWatchlist, quickCheckout } = useWatchlist();
  const { fetchRequests } = useProducts();

  useEffect(() => {
    getWatchlist(user.uid);
    console.log(process.env.NODE_ENV);
    fetchRequests(user.uid);
  }, [user]);

  return (
    <div className="App">
      {!user ? (
        <Loader expand={true} />
      ) : (
        <Router>
          <Switch>
            <Route path="/addProduct">
              <AddProdPage />
            </Route>
            <Route path="/">
              <HomePage />
            </Route>
          </Switch>
        </Router>
      )}
      {quickCheckout.length > 0 ? (
        <QuickPay data={quickCheckout} />
      ) : (
        <Fragment></Fragment>
      )}
    </div>
  );
}

export default App;
