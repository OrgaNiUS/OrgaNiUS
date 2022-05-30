import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { toTitleCase } from "../functions/strings";
import "../styles/Settings.css";

// do ensure these keys match keys
interface Fields {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

const defaultFields: Fields = {
  username: "jinwei",
  email: "email@mail.com",
  password: "",
  confirm_password: "",
};

const GET_SELF_URL: string = "api/v1/own_user";

// ensure these keys match the keys of interface Fields
// keyof Fields is there to prevent extra keys (but cannot prevent missing/duplicate keys, no other better yet simple solution)
// https://stackoverflow.com/questions/43909566/get-keys-of-a-typescript-interface-as-array-of-strings
const keys: (keyof Fields)[] = ["username", "email", "password"];

const Settings = (): JSX.Element => {
  const [selection, setSelection] = useState<typeof keys[number]>();
  const [fields, setFields] = useState<Fields>(defaultFields);

  useEffect(() => {
    // get user name and email and populate fields on page load
    axios
      .get(GET_SELF_URL)
      .then((response) => {
        const data = response.data;
        setFields({ ...fields, username: data["name"], email: data["email"] });
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleClick = (key: keyof Fields) => {
    setSelection(key);
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();
    setFields({ ...fields, [event.target.name]: event.target.value });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    // TODO: not actually submitting to backend yet
    console.log("pressed submit");
  };

  return (
    <>
      <div className="flex flex-col relative top-20 margin-top">
        <div className="mx-20 mt-10 justify-center items-center">
          <div className="left centered">
            <h1 className="header1">Settings</h1>
            {keys.map((key, i) => {
              return (
                <div>
                  <button className="changeButton" key={i} onClick={() => handleClick(key)}>
                    {`Change ${toTitleCase(key)}`}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="right centered">
            {selection === undefined ? (
              <div className="vert-center">{"<- Please choose the field you want to edit!"}</div>
            ) : (
              <form className="" onSubmit={handleSubmit}>
                <h1 className="header2">Changing...</h1>
                {selection !== "password" ? (
                  <div>
                    <label>{toTitleCase(selection)}</label>
                    <input
                      className="inputField"
                      type="text"
                      name={selection}
                      onChange={handleChange}
                      value={fields[selection]}
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label>Password</label>
                      <input
                        className="inputField"
                        type="password"
                        name="password"
                        onChange={handleChange}
                        value={fields[selection]}
                        required
                      />
                    </div>
                    <div>
                      <label>Confirm Password</label>
                      <input
                        className="inputField"
                        type="password"
                        name="confirm_password"
                        onChange={handleChange}
                        value={fields["confirm_password"]}
                        required
                      />
                    </div>
                  </>
                )}
                <input className="submitButton" type="submit" value="Submit" />
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
