//შემოსულ მონაცემს გაუკეთოს ენკოდი
function encode(inputValue) {
    var result;

    //შემთხვევა, როცა შემოსული მონაცემი მასივია
    if (inputValue.constructor === Array) {
        result = Array();
        for (var i in inputValue) {
            result[i] = encodeURIComponent(inputValue[i]);
        }

        //შემთხვევა, როცა შემოსული მონაცემი ობიექტია
    } else if (typeof inputValue == 'object') {
        result = "";

        for (var i in inputValue) {
            result += (i + "=" + encodeURIComponent(inputValue[i]));
            result += "&";
        }
        ;
        result = result.substr(0, result.length - 1);

        //შემთხვევა, როცა შემოსული მონაცემი სტრინგია
    } else {
        result = encodeURIComponent(inputValue);
    }
    console.log(result);
}

//შემოსულ მონაცემებს გაუკეთოს დეკოდი
function decode(inputValue) {
    var result;
    //შემთხვევა, როცა მასივია
    if (inputValue.constructor === Array) {
        result = Array();
        for (var i in inputValue) {
            result[i] = decodeURIComponent(inputValue[i]);
        }

        //ეძებს ამპერსანტებზე და შემდეგ გადაყვება და ხლეჩს ტოლობებზე
    } else if (inputValue.indexOf('=') > 0) {
        result = {};
        var splitsResults = inputValue.split("&");
        for (var i in splitsResults) {
            var splitOnEqualMark = splitsResults[i].split("=");
            result[splitOnEqualMark[0]] = decodeURIComponent(splitOnEqualMark[1]);
        }
        console.log(result);
    } else {
        result = decodeURIComponent(inputValue);
    }
}

function encodeString(inputValue) {
    var result = "";
    var code;

    for (var i in inputValue) {
        code = inputValue.charCodeAt(i);
        if (code >= 123 || code <= 47 || (code >= 58 && code <= 64) || (code >= 91 && code <= 96))
            result += encodeCharacter(inputValue[i]);
        else
            result += inputValue[i];
    }
    return result;
}

function encodeCharacter(character) {
    var code = character.charCodeAt(0);
    var binaryCodeUTF16 = Number(code).toString(2);
    var binaryCodeUTF8 = "";
    var hexCodeUTF8 = "";
    var percentEncoded = "";
    var counter = 0;
    var byteCounter = 0;

    //შეამოწმოს შემოსული ქუერის ბინარული კოდის UTF_16 ფორმატში სიგრძე და თუ არ არის ერთი ბაიტი შეავსოს ნულებით
    if (code >= 0 && code < 128) {
        for (var i = 0; i < 8 - binaryCodeUTF16.length; i++) {
            binaryCodeUTF8 += "0";
        }

        // გაპარსოს ინტად UTF8 -ის ბინარული კოდი, გადაიყვანოს თექვსმეტობითში და მიანიჭოს შესაბამის ცვლადს
        binaryCodeUTF8 += binaryCodeUTF16;
        hexCodeUTF8 = parseInt(binaryCodeUTF8, 2).toString(16);

        // ყოველ ორის ჯერად ადგილას ჩაამატოს % -ი
        for (i in hexCodeUTF8) {
            if (i % 2 == 0)
                percentEncoded += "%";
            percentEncoded += hexCodeUTF8[i];
        }
        return percentEncoded;
    }

    // დაუყვეს ბოლოდან და ყოველ მეექვსე ელემენტზე წინ მიუწეროს 10
    for (i = binaryCodeUTF16.length - 1; i >= 0; i--) {
        if (counter % 6 == 0 && counter > 0) {
            binaryCodeUTF8 = "10" + binaryCodeUTF8;
            byteCounter = 0;
        }
        binaryCodeUTF8 = binaryCodeUTF16[i] + binaryCodeUTF8;
        counter++;
        byteCounter++;
    }

    //მერვე ელემენტი უნდა იყოს ერთი
    for (i = 0; i < (7 - counter / 6 - byteCounter); i++) {
        binaryCodeUTF8 = "0" + binaryCodeUTF8;
    }
    for (i = 0; i < counter / 6; i++) {
        binaryCodeUTF8 = "1" + binaryCodeUTF8;
    }
    console.log(binaryCodeUTF8);
    hexCodeUTF8 = parseInt(binaryCodeUTF8, 2).toString(16);
    console.log(hexCodeUTF8);

    for (i in hexCodeUTF8) {
        if (i % 2 == 0)
            percentEncoded += "%";
        percentEncoded += hexCodeUTF8[i];
    }
    return percentEncoded;
}

function decodeString(inputValue) {
    var hexArray = inputValue.split("%");
    hexArray.splice(0, 1);
    var decArray = getDecFromHexArray(hexArray);

    //ითვლის რამდენი ოქტეტი მოყვება და ამის მიხედვით ადგენს რამდენი ერთიანი უნდა ჰქონდეს თავში
    for (var octetCounter = 0; octetCounter < decArray.length; octetCounter++) {
        var binaryCodeUTF8 = "";
        var xorNum = 0;
        var foll = followers(decArray[octetCounter]);
        //ზრდის შესაბამისი ორის ხარისხით
        if (foll > 0) {
            var x = 128;
            for (i = 0; i < foll + 1; i++) {
                xorNum += x;
                x /= 2;
            }
            // გაქსორვა
            binaryCodeUTF8 += ((decArray[octetCounter] ^ xorNum).toString(2));
        }
        octetCounter++;
        var lastOctet = octetCounter + foll;
        for (; octetCounter < lastOctet; octetCounter++) {
            var octetBin = (decArray[octetCounter] ^ 128).toString(2);
            var zeros = "";
            for (i = 0; i < (6 - octetBin.length); i++) {
                zeros += "0";
            }
            octetBin = zeros + octetBin;
            binaryCodeUTF8 += octetBin;
        }
        octetCounter--;
        console.log(String.fromCharCode(parseInt(binaryCodeUTF8, 2)));
    }
}

function followers(octDecimal) {

	if(octDecimal >= 0 && octDecimal < 128) {
		return 0;
	} else if(octDecimal >= 192 && octDecimal <= 223) {
		return 1;
	} else if(octDecimal >= 224 && octDecimal <= 239) {
		return 2;
	} else if(octDecimal >= 240 && octDecimal <= 247) {
		return 3;
	} else if(octDecimal >= 248 && octDecimal <= 251) {
		return 4;
	} else if(octDecimal >= 252 && octDecimal <= 253) {
		return 5;
	}
}


function getDecFromHexArray(hexArray){
	var arr = Array();
	for(i in hexArray) {
		arr[i] = parseInt(hexArray[i],16);
	}
	return arr;
}