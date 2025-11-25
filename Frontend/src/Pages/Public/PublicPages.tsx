import React, { useState } from 'react';
import LandingPage from './LandingPage';
import AuthPage from './AuthPage';

export default function PublicPages(props: { setLoginToken: (t: string | null) => void }) {
    const [Mode, setMode] = useState<number>(0);
    return (
        <div>
            {Mode === 0 
                ? <LandingPage setMode={setMode} /> 
                : <AuthPage mode={Mode} setMode={setMode} setLoginToken={props.setLoginToken} />
            }
        </div>
    );
}