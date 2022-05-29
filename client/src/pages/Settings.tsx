import React, { useState } from "react";
import SettingsModal from "../components/SettingsModal";

interface Fields {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

const defaultFields: Fields = {
  username: "",
  email: "",
  password: "",
  confirm_password: "",
};

const Settings = (): JSX.Element => {
  const [fields, setFields] = useState<Fields>(defaultFields);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setFields({ ...fields, [event.target.name]: event.target.value });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {};

  // TODO: load name, email for initial placeholder
  return (
    <>
      <SettingsModal {...{ title: "Title", text: "Text" }} />
      <div className="flex flex-col relative top-20 margin-top">
        <div className="md:w-8/12 lg:w-6/12 lg:ml-20 justify-center items-center max-w-2xl">
          <h1 className="text-3xl">Settings</h1>
          <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Change Username
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default Settings;
