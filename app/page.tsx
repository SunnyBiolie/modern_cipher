"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  IP_Index,
  IP_Inverse_Index,
  PC1_Index,
  PC2_Index,
  numberOfLeftShifts,
} from "@/cipher/constants";
import feistel from "@/cipher/feistel";
import {
  binToHex,
  displayWithSpace,
  getXOR_Binary,
  hexToBin,
  leftShift,
  permutateByConstants,
  textToHex,
} from "@/cipher/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ElementRef, useRef, useState } from "react";
import { generateKeys } from "@/cipher/generateKeys";

export default function Home() {
  const messInputRef = useRef<ElementRef<"input">>(null);

  const [message, setMessage] = useState<string | null>(null);

  // Example:
  // M = "02468ACEECA86420"
  // K = "0F1571C947D9E859"
  // C = "DA02CE3A89ECAC3B"

  // --------------- Sinh khóa ---------------
  const K = "133457799BBCDFF1";
  // const K = "0F1571C947D9E859";

  const { PC1, C0, D0, array_Cn, array_Dn, array_Kn } = generateKeys(K);

  // --------------- Mã hóa ---------------

  const M = "0123456789ABCDEF";
  // const M = "02468ACEECA86420";

  const M_Bin = hexToBin(M);

  // Hoán vị IP
  const IP = permutateByConstants(M_Bin, IP_Index);

  const L0 = IP.slice(0, 32);
  const R0 = IP.slice(32);

  const array_Ln: string[] = [];
  const array_Rn: string[] = [];

  let Ln: string = L0,
    Rn: string = R0;
  array_Kn.forEach((key, index) => {
    const tempRn = Rn;
    const { E_Rn_Binary, XOR_Result, sBox_Binary, P_Binary } = feistel(Rn, key);
    Rn = getXOR_Binary(Ln, P_Binary);
    Ln = tempRn;

    array_Ln.push(Ln);
    array_Rn.push(Rn);
  });

  // Hoán vị IP-1
  const code = permutateByConstants(Rn + Ln, IP_Inverse_Index);

  return (
    <div className="flex items-center justify-between py-8 px-16">
      <div className="flex-1 flex flex-col items-center justify-center gap-x-8">
        <div className="flex flex-col items-center justify-center gap-y-4">
          <div>K: {K}</div>
          <div>PC1: {binToHex(PC1)}</div>
          <div>
            C<sub>0</sub>: {binToHex(C0)} ----- D<sub>0</sub>: {binToHex(D0)}
          </div>
        </div>
        <div className="flex items-center justify-center gap-x-8">
          <Table>
            <TableHeader>
              <TableRow className="font-medium">
                <TableHead>i</TableHead>
                <TableHead className="text-center">
                  S<sub>i</sub>
                </TableHead>
                <TableHead className="text-center">
                  C<sub>i</sub>
                </TableHead>
                <TableHead className="text-center">
                  D<sub>i</sub>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {array_Cn.map((Cn, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="text-center">
                    {numberOfLeftShifts[index]}
                  </TableCell>
                  <TableCell className="text-center">{Cn}</TableCell>
                  <TableCell className="text-center">
                    {array_Dn[index]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div>
            <Table>
              <TableHeader>
                <TableRow className="font-medium">
                  <TableHead>
                    K<sub>i</sub>
                  </TableHead>
                  <TableHead className="text-center">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {array_Kn.map((ele, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">K{index + 1}</TableCell>
                    <TableCell className="text-center">
                      {binToHex(ele)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center gap-y-4">
        <div>M: {M}</div>
        <div>Hoán vị IP: {displayWithSpace(binToHex(IP), 2)}</div>
        <div>
          L<sub>0</sub>: {displayWithSpace(binToHex(L0), 2)} ----- R<sub>0</sub>
          : {displayWithSpace(binToHex(R0), 2)}
        </div>
        <div>
          <Table>
            <TableHeader>
              <TableRow className="font-medium">
                <TableHead>i</TableHead>
                <TableHead className="text-center">
                  L<sub>i</sub>
                </TableHead>
                <TableHead className="text-center">
                  R<sub>i</sub>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {array_Ln.map((Ln, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="text-center">{binToHex(Ln)}</TableCell>
                  <TableCell className="text-center">
                    {binToHex(array_Rn[index])}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          R<sub>16</sub>L<sub>16</sub>: {binToHex(Rn + Ln)}
        </div>
        <div>
          IP<sup>-1</sup>: {binToHex(code)}
        </div>
      </div>
    </div>
  );
}
