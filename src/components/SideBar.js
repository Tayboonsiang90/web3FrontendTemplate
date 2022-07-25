// Pages import for <Link></Link> to work
import Link1 from "../pages/Link1";
import Link2 from "../pages/Link2";
import Home from "../pages/Home";
import FAQ from "../pages/FAQ";
// React Imports
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import React, { useEffect } from "react";

export default function SideBar() {
    return (
        <>
            <Link className="text-nowrap" to="/">
                Home
            </Link>
            <Link className="text-nowrap" to="/Link1">
                Link 1
            </Link>
            <Link className="text-nowrap" to="/Link2">
                Link 2
            </Link>
            <Link className="text-nowrap" to="/FAQ">
                FAQ
            </Link>
        </>
    );
}
