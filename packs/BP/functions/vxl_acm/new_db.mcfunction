scoreboard objectives remove acm.vxl.test

scoreboard objectives add acm.vxl.test dummy
scoreboard players    add "bool_test(bool)"              acm.vxl.test 0
scoreboard players    add "range_test(range[1, 10, 1])"  acm.vxl.test 5
scoreboard players    add "choice_test(choice[a, b, c])" acm.vxl.test 0
scoreboard players    add "input_test(input[Default])"   acm.vxl.test 0
