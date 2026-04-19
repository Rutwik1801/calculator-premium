import React, { useState } from "react";

export default function App() {
  return <PayoutCalculator />;
}

export function PayoutCalculator() {
  const [form, setForm] = useState({
    NP: "",
    totalAgents: "",
    qualifiedAgents: "",
    renewalNP: "",
    persistency: "",
    tenure: "1",
    businessType: "fresh",
    indirectNP: "",
    agentVintage: "M0-M2",
    renewalType: "R1",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  };

  const labelStyle = {
    fontWeight: "600",
    marginTop: "12px",
    display: "block",
  };

  const calculate = () => {
    let {
      NP,
      qualifiedAgents,
      renewalNP,
      persistency,
      tenure,
      businessType,
      indirectNP,
      agentVintage,
      renewalType,
      totalAgents,
    } = form;

    if (Number(qualifiedAgents) > Number(totalAgents)) {
      alert("Qualified agents cannot exceed total agents");
      return;
    }

    NP = Number(NP) || 0;
    qualifiedAgents = Number(qualifiedAgents) || 0;
    renewalNP = Number(renewalNP) || 0;
    persistency = Number(persistency) || 0;
    indirectNP = Number(indirectNP) || 0;
    tenure = Number(tenure);

    let adjustedNP = NP;
    if (tenure === 2) adjustedNP *= 0.5;
    if (tenure === 3) adjustedNP *= 0.3333;

    function getNBPPercent(np, activation) {
      if (activation < 2 || np < 50000) return 0;

      const slabs = [
        { min: 50000, max: 100000, values: [2, 3, 4, 6, 8] },
        { min: 100000, max: 200000, values: [4, 6, 7.5, 10, 10] },
        { min: 200000, max: 300000, values: [6, 8, 10, 12.5, 12.5] },
        { min: 300000, max: 500000, values: [8, 10, 12.5, 15, 15] },
        { min: 500000, max: 750000, values: [10, 12.5, 15, 17.5, 17.5] },
        { min: 750000, max: Infinity, values: [12, 15, 17.5, 20, 22.5] },
      ];

      let col;
      if (activation === 2) col = 0;
      else if (activation <= 4) col = 1;
      else if (activation <= 6) col = 2;
      else if (activation <= 8) col = 3;
      else col = 4;

      for (let slab of slabs) {
        if (np >= slab.min && np < slab.max) {
          return slab.values[col] / 100;
        }
      }

      return 0;
    }

    const nbpPercent = getNBPPercent(adjustedNP, qualifiedAgents);
    let nbpEarning = adjustedNP * nbpPercent;

    if (businessType === "port") nbpEarning *= 0.5;

    function getActivationPay(activation, vintage) {
      const table = {
        "M0-M2": [
          [5, 7, 900],
          [8, 10, 1100],
          [11, 15, 1350],
          [16, Infinity, 1750],
        ],
        "M3+": [
          [5, 7, 700],
          [8, 10, 900],
          [11, 15, 1200],
          [16, Infinity, 1500],
        ],
      };

      for (let [min, max, val] of table[vintage]) {
        if (activation >= min && activation <= max) return val;
      }
      return 0;
    }

    const perAgent = getActivationPay(qualifiedAgents, agentVintage);
    const activationEarning =
      qualifiedAgents >= 5 ? qualifiedAgents * perAgent : 0;

    function getLeadershipPercent(np) {
      if (np < 100000) return 0;
      if (np <= 200000) return 0.01;
      if (np <= 300000) return 0.02;
      if (np <= 400000) return 0.03;
      if (np <= 500000) return 0.05;
      return 0.07;
    }

    const leadershipEarning = indirectNP * getLeadershipPercent(indirectNP);

    function getRenewalPercent(persistency, type) {
      if (persistency <= 70) return 0;

      if (persistency <= 75) return { R1: 0.03, R2: 0.02, "R3+": 0.005 }[type];

      if (persistency <= 80) return { R1: 0.04, R2: 0.03, "R3+": 0.0075 }[type];

      if (persistency <= 85) return { R1: 0.05, R2: 0.04, "R3+": 0.01 }[type];

      return { R1: 0.06, R2: 0.05, "R3+": 0.015 }[type];
    }

    const renewalPercent = getRenewalPercent(persistency, renewalType);

    const renewalEarning = renewalNP * (renewalPercent || 0);

    const total =
      nbpEarning + activationEarning + leadershipEarning + renewalEarning;

    const final = total / 1.18;

    setResult({
      nbpEarning,
      activationEarning,
      leadershipEarning,
      renewalEarning,
      total,
      final,
    });
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "auto",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        background: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Payout Calculator</h2>

      <label style={labelStyle}>Net Premium (NP)</label>
      <input name="NP" onChange={handleChange} style={inputStyle} />

      <label style={labelStyle}>Total Agents</label>
      <input name="totalAgents" onChange={handleChange} style={inputStyle} />

      <label style={labelStyle}>Qualified Agents (₹10K+)</label>
      <input
        name="qualifiedAgents"
        onChange={handleChange}
        style={inputStyle}
      />

      <label style={labelStyle}>Renewal Premium</label>
      <input name="renewalNP" onChange={handleChange} style={inputStyle} />

      <label style={labelStyle}>Persistency (%)</label>
      <input name="persistency" onChange={handleChange} style={inputStyle} />

      <label style={labelStyle}>Indirect NP (Team)</label>
      <input name="indirectNP" onChange={handleChange} style={inputStyle} />

      <label style={labelStyle}>Tenure</label>
      <select name="tenure" onChange={handleChange} style={inputStyle}>
        <option value="1">1 Year</option>
        <option value="2">2 Years</option>
        <option value="3">3 Years</option>
      </select>

      <label style={labelStyle}>Business Type</label>
      <select name="businessType" onChange={handleChange} style={inputStyle}>
        <option value="fresh">Fresh</option>
        <option value="port">Port</option>
      </select>

      <label style={labelStyle}>Agent Vintage</label>
      <select name="agentVintage" onChange={handleChange} style={inputStyle}>
        <option value="M0-M2">M0-M2</option>
        <option value="M3+">M3+</option>
      </select>

      <label style={labelStyle}>Renewal Type</label>
      <select name="renewalType" onChange={handleChange} style={inputStyle}>
        <option value="R1">R1</option>
        <option value="R2">R2</option>
        <option value="R3+">R3+</option>
      </select>

      <button
        onClick={calculate}
        style={{
          width: "100%",
          marginTop: 20,
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          background: "#007bff",
          color: "#fff",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Calculate
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Breakdown</h3>
          <p>NBP: ₹{result.nbpEarning.toFixed(0)}</p>
          <p>Activation: ₹{result.activationEarning.toFixed(0)}</p>
          <p>Leadership: ₹{result.leadershipEarning.toFixed(0)}</p>
          <p>Renewal: ₹{result.renewalEarning.toFixed(0)}</p>
          <hr />
          <p>Total: ₹{result.total.toFixed(0)}</p>
          <h3>Final (After GST): ₹{result.final.toFixed(0)}</h3>
        </div>
      )}
    </div>
  );
}
