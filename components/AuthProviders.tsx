"use client";

import { useState, useEffect } from "react";
import { getProviders, signIn } from "next-auth/react";
import Button from "./Button";

type Provider = {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
  signinUrlParams?: Record<string, string> | null;
};

type Providers = Record<string, Provider>;

const AuthProviders = () => {
  // <type of usetate>
  const [providers, setProviders] = useState<Providers | null>(null);

  //Fetch providers
  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();

      console.log(res);
      setProviders(res);
    };

    fetchProviders();
  }, []);

  if (providers) {
    return (
      <div>
        {Object.values(providers).map((provider: Provider, i) => (
          <Button
            key={i}
            handleClick={() => signIn(provider?.id)}
            title="Sign In"
          />
        ))}
      </div>
    );
  }
};

export default AuthProviders;
