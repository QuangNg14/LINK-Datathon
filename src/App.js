import SearchScreen from "./components/SearchScreen/SearchScreen";
import { Route, Switch } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={SearchScreen} />
      </Switch>
    </div>
  );
}

export default App;
