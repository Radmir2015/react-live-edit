import "./styles.css";
import MyAppBar from "./components/MyAppBar";
import EditableForm from "./components/EditableForm";
import { useLocalStorage } from "./hooks/useLocalStorage";

export default function App(props: { match: any; history: any }) {
  console.log(props.match.params);

  const account = useLocalStorage("accountId", 0);

  return (
    <div className="App">
      <MyAppBar account={account} />
      <EditableForm
        account={account}
        params={props.match.params}
        history={props.history}
      />
    </div>
  );
}
