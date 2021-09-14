<script>
let red = document.getElementById('red');
let green = document.getElementById('green');
let blue = document.getElementById('blue');
let box = document.querySelector('div.neumorphism-3');

let r = 0, g = 0, b = 0;

red.addEventListener("keyup", function (event) {
    r = red.value;
    if (!r)
        r = 0;
    box.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
});

green.addEventListener("keyup", function (event) {
    g = green.value;
    if (!g)
        g = 0;
    box.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
});

blue.addEventListener("keyup", function (event) {
    b = blue.value;
    if (!b)
        b = 0;
    box.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
});
</script>

<section>
    <div class="neumorphism-3"></div>
    <div class="inpt">
        <input type="number" id="red">
        <input type="number" id="green">
        <input type="number" id="blue">
    </div>
    <h1 class="rainbow-text">--RGB-TO-COLOR--</h1>
    <script src="script.js"></script>
</section>

<style>
* {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}

body {
    background: #f7f7f7;
    padding-top: 14%;
}

.neumorphism-3 {
    width: 300px;
    height: 300px;
    border-radius: 50%;
    box-shadow: -3px -3px 7px #e9e9e9a9,
        3px 3px 7px #e9e9e9a9;
    position: absolute;
    top: 40px;
    left: 490px;
}

.neumorphism-3:hover {
    top: 30px;
    box-shadow: -3px -3px 7px #999999a9,
        -3px -3px 12px #e9e9e9a9,
        3px 3px 7px #999999a9,
        -3px -3px 12px #e9e9e9a9;
    animation: uplift 0.1s 1 linear;
}

.neumorphism-3:not( :hover) {
    animation: downlift 0.1s 1 linear;
    top: 40px;
}

@keyframes uplift {
    0% {
        top: 40px;
    }

    25% {
        top: 37.5px;
    }

    50% {
        top: 35px;
    }

    75% {
        top: 32.5px;
    }

    100% {
        top: 30px;
    }
}

@keyframes downlift {
    0% {
        box-shadow: -3px -3px 7px #999999a9,
            -3px -3px 12px #e9e9e9a9,
            3px 3px 7px #999999a9,
            -3px -3px 12px #e9e9e9a9;
        top: 30px;
    }

    25% {
        box-shadow: -3px -3px 7px #b3b3b3a9,
            -3px -3px 12px #e9e9e9a9,
            3px 3px 7px #b3b3b3a9,
            -3px -3px 12px #e9e9e9a9;
        top: 32.5px;
    }

    50% {
        top: 35px;
        box-shadow: -3px -3px 7px #d6d6d6a9,
            -3px -3px 12px #e9e9e9a9,
            3px 3px 7px #d6d6d6a9,
            -3px -3px 12px #e9e9e9a9;
    }

    75% {
        top: 37.5px;
        box-shadow: -3px -3px 7px #f3f3f3a9,
            -3px -3px 12px #e9e9e9a9,
            3px 3px 7px #f3f3f3a9,
            -3px -3px 12px #e9e9e9a9;
    }

    100% {
        box-shadow: -3px -3px 7px #e9e9e9a9,
            3px 3px 7px #e9e9e9a9;
        top: 40px;
    }
}

div.inpt {
    position: absolute;
    top: 450px;
    left: 550px;
}

div.inpt input {
    height: 30px;
    width: 60px;
    font-size: 30px;
    color: seashell;
    text-align: center;
    opacity: 0.7;
    border: none;
    border-radius: 4px;
}

#red {
    background-color: red;
}

#green {
    background-color: green;
}

#blue {
    background-color: blue;
}

/* Chrom, Safar, Edge */

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
input[type=number] {
    -moz-appearance: textfield;
}

.rainbow-text {
    background-image: linear-gradient (
            to left, violet, indigo, blue,
            green, yellow, orange, red);
    width: 300px;
    height: 50px;
    -webkit-background-clip: text;
    color: transparent;
    font-family: "Itim";
    text-align: center;
    position: relative;
    top: 340px;
    left: 500px;
}
</style>
