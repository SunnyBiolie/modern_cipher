import {
  IP_Index,
  PC1_Index,
  PC2_Index,
  P_Index,
  S1DecimalSelector,
  S2DecimalSelector,
  S3DecimalSelector,
  S4DecimalSelector,
  S5DecimalSelector,
  S6DecimalSelector,
  S7DecimalSelector,
  S8DecimalSelector,
  eBitSelector_Index,
  numberOfLeftShifts,
} from "@/cipher/constants";

export default function Home() {
  const K = "133457799BBCDFF1";

  const hexToBin = (hexText: string) => {
    let result: string = "";
    hexText.split("").forEach((char) => {
      result += parseInt(char, 16).toString(2).padStart(4, "0");
    });
    return result;
  };

  const binToHex = (binText: string) => {
    const array = splitIntoNCharArray(binText, 4);

    let result: string = "";
    array.forEach((item) => {
      result += parseInt(item, 2).toString(16).toUpperCase();
    });
    return result;
  };

  const splitIntoNCharArray = (text: string, itemLength: number) => {
    const array: string[] = [];
    let index: number = 0;
    let count: number = 1;
    text.split("").forEach((char) => {
      if (count > itemLength) {
        index++;
        count = 1;
      }

      if (count === 1) {
        array[index] = char;
      } else array[index] += char;

      count++;
    });

    return array;
  };

  const getPC1 = (KBinary: string) => {
    let PC1: string = "";

    PC1_Index.forEach((row) => {
      row.forEach((indexPlus) => {
        PC1 += KBinary[indexPlus - 1];
      });
    });

    return PC1;
  };

  /**
   * Dịch vòng trái một chuỗi 28 ký tự nhị phân theo bảng dịch vòng cho trước (16 lần dịch vòng),
   * kết quả của vòng trước là bắt đầu của vòng sau.
   *
   * Kết quả trả về là một mảng gồm 16 phần tử là kết quả của những lần dịch vòng.
   *
   * @param {String} binText
   */
  const leftShift = (binText: string) => {
    const array: string[] = [];
    let init = binText;
    numberOfLeftShifts.forEach((value) => {
      const result = init.substring(value) + init.slice(0, value);
      array.push(result);
      init = result;
    });

    return array;
  };

  const getPC2 = (CDBinary: string) => {
    let PC2: string = "";

    PC2_Index.forEach((row) => {
      row.forEach((indexPlus) => {
        PC2 += CDBinary[indexPlus - 1];
      });
    });

    return PC2;
  };

  const res = hexToBin(K);

  const pc1 = getPC1(res);
  const C0 = pc1.slice(0, 28);
  const D0 = pc1.slice(28);

  const pc1_in_hex = binToHex(pc1);

  const array_Cn = leftShift(C0);
  const array_Dn = leftShift(D0);

  const array_Kn: string[] = [];
  for (let i = 0; i < array_Cn.length; i++) {
    array_Kn.push(getPC2(array_Cn[i] + array_Dn[i]));
  }

  //

  const M = "0123456789ABCDEF";

  const getIP = (MessageBinary: string) => {
    let IP: string = "";

    IP_Index.forEach((row) => {
      row.forEach((indexPlus) => {
        IP += MessageBinary[indexPlus - 1];
      });
    });

    return IP;
  };

  const getExpandHalfRight = (RnBinary: string) => {
    let E_Rn: string = "";

    eBitSelector_Index.forEach((row) => {
      row.forEach((indexPlus) => {
        E_Rn += RnBinary[indexPlus - 1];
      });
    });

    return E_Rn;
  };

  const XOR_Binary = (KnBinary: string, E_RnBinary: string) => {
    let result = "";
    for (let i = 0; i < KnBinary.length; i++) {
      if (KnBinary[i] === E_RnBinary[i]) {
        result += "0";
      } else result += "1";
    }

    return result;
  };

  const getSBoxn = (sixBitText: string, indexPlus: number) => {
    const selectRow = sixBitText[0] + sixBitText[5];
    let x: number = 0;
    if (selectRow === "00") x = 0;
    else if (selectRow === "01") x = 1;
    else if (selectRow === "10") x = 2;
    else if (selectRow === "11") x = 3;

    const selectColumn = sixBitText.slice(1, 5);
    const y = parseInt(selectColumn, 2);

    let decimalResult: number;
    switch (indexPlus) {
      case 1:
        decimalResult = S1DecimalSelector[x][y];
        break;
      case 2:
        decimalResult = S2DecimalSelector[x][y];
        break;
      case 3:
        decimalResult = S3DecimalSelector[x][y];
        break;
      case 4:
        decimalResult = S4DecimalSelector[x][y];
        break;
      case 5:
        decimalResult = S5DecimalSelector[x][y];
        break;
      case 6:
        decimalResult = S6DecimalSelector[x][y];
        break;
      case 7:
        decimalResult = S7DecimalSelector[x][y];
        break;
      case 8:
        decimalResult = S8DecimalSelector[x][y];
        break;
    }

    return decimalResult!.toString(2).padStart(4, "0");
  };

  const permutationP = (sBox_Binary: string) => {
    let P: string = "";

    P_Index.forEach((row) => {
      row.forEach((indexPlus) => {
        P += sBox_Binary[indexPlus - 1];
      });
    });

    return P;
  };

  // const display = (text: string, type: "bin" | "hex") => {
  //   switch (type) {
  //     case "bin":
  //       break;
  //   }
  // };

  const message = hexToBin(M);
  const IP = getIP(message);

  const L0 = IP.slice(0, 32);
  const R0 = IP.slice(32);
  const E_R0 = getExpandHalfRight(R0);

  const B = XOR_Binary(array_Kn[0], E_R0);

  const array_B = splitIntoNCharArray(B, 6);

  let sBox_Binary: string = "";
  array_B.forEach((sixBit, index) => {
    sBox_Binary += getSBoxn(sixBit, index + 1);
  });

  return (
    <div className="flex flex-col items-center justify-center gap-y-8">
      <div>
        {array_Kn.map((ele, index) => (
          <p key={index}>{binToHex(ele)}</p>
        ))}
      </div>
      <div>
        {array_B.map((ele, index) => (
          <p key={index}>{ele}</p>
        ))}
      </div>
      <div>
        {array_B.map((ele, index) => (
          <p key={index}>{binToHex(getSBoxn(ele, index + 1))}</p>
        ))}
      </div>
      <div>{binToHex(permutationP(sBox_Binary))}</div>
    </div>
  );
}
