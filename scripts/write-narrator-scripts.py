#!/usr/bin/env python3
"""Write clean narrator scripts for Phase 1 narration segments."""
import json

# Hand-written narrator scripts: {task_id: [(narrator_before, narrator_after), ...]}
NARRATOR_SCRIPTS = {
    "kn-211": [
        ("Ramu moved to Bengaluru last week. This morning, he walks to the small shop near his house.", "Shop is angadi. House is mane."),
        ("He sees the shopkeeper and greets him.", "That's how you say hello in Kannada."),
        ("Ramu wants coffee. He tells the shopkeeper.", "That means: give one hot coffee."),
        ("The shopkeeper asks a question.", "Do you want sugar?"),
        ("Ramu replies.", "Yes, a little sugar, and a little milk."),
        ("The coffee is ready. Ramu takes a sip and smiles.", "Very good! Thank you!"),
    ],
    "kn-212": [
        ("Ramu's landlady Lakshmi tells him to go to a quick restaurant for food.", "Go to the restaurant for food."),
        ("Ramu walks in and sees the menu. The owner Meera asks him.", "What do you want?"),
        ("Ramu orders.", "Give two idlis."),
        ("Then he adds.", "And one dosa."),
        ("The food arrives. Ramu eats and tells Meera.", "Very good!"),
        ("Ramu asks how much it costs. Meera tells him.", "How much? Thirty rupees."),
        ("Ramu pays and thanks her.", "Thank you, very good food!"),
    ],
    "kn-213": [
        ("Ramu needs to go to work. He sees an auto rickshaw. The driver is Venkatesh.", "Hello! Go to Majestic."),
        ("Venkatesh asks where exactly.", "Where?"),
        ("Ramu answers.", "Near the bus stand."),
        ("Ramu asks the price. Venkatesh answers.", "How much will it be? Hundred rupees."),
        ("Ramu thinks it's too expensive.", "Too much! Reduce a little."),
        ("Venkatesh agrees to a lower price. They drive off.", "Okay, eighty rupees."),
        ("On the way, Venkatesh gives directions.", "Turn right. Turn left."),
        ("They arrive. Ramu tells him to stop.", "Stop here. Thank you!"),
    ],
    "kn-214": [
        ("Ramu reaches his office. A woman walks up and introduces herself.", "Hello! My name is Priya."),
        ("Ramu introduces himself back.", "Hello! My name is Ramu."),
        ("Priya asks where he's from.", "Where is your town?"),
        ("Ramu tells her.", "I'm from Delhi."),
        ("Priya asks if he knows Kannada.", "Do you know Kannada?"),
        ("Ramu laughs. Priya encourages him.", "A little bit! No problem, you'll learn!"),
        ("Priya teaches him a greeting.", "How are you? I'm fine!"),
    ],
    "kn-215": [
        ("Ramu is in Jayanagar. He needs to find a medical shop but he's lost.", "Medical shop. I don't know."),
        ("He sees an old man and asks for directions.", "Excuse me, where is the medical shop?"),
        ("The man tells him to go straight.", "Go straight."),
        ("Then gives more directions.", "Turn right. Go a little forward."),
        ("The man adds where the shop is.", "The shop is on the right side."),
        ("Ramu asks if it's far. The man reassures him.", "Is it far? No, it's nearby."),
        ("Ramu follows the directions and finds the shop. He's proud.", "I know Kannada!"),
    ],
    "kn-241": [
        ("It's evening in Bengaluru. Ramu calls his mother in Delhi.", "Evening. Mother."),
        ("His mother answers. Ramu tells her he's fine.", "Ramu! How are you? I'm fine, Mom."),
        ("She asks about work. Ramu says it's going well.", "How is work? Work is very good."),
        ("She asks if he's eating properly. Ramu reassures her.", "Are you eating properly? Yes! This morning I ate idli."),
        ("Ramu asks about his father. His mother gives family news.", "How is father? Father is fine. Your sister is coming tomorrow."),
        ("Ramu is happy. He'll call again tomorrow night.", "Very happy! I'll call tomorrow night."),
        ("His mother says take care. Ramu says goodbye.", "Okay, take care. Goodbye, Mom."),
    ],
    "kn-242": [
        ("It's Saturday morning. Lakshmi invites Ramu to the market.", "Ramu, let's go to the market!"),
        ("At the market, Lakshmi points to a shop.", "This is the vegetable shop."),
        ("Lakshmi orders vegetables.", "Give one kilo tomatoes. And half a kilo potatoes."),
        ("The seller quotes a price. Lakshmi bargains.", "Tomatoes, forty rupees per kilo. Too much! Give for thirty."),
        ("Ramu sees onions and asks the price.", "How much are onions? Twenty rupees."),
        ("Lakshmi picks up green chillies and red fruit.", "Green chillies. Red fruit."),
        ("Ramu asks for the total. Lakshmi pays.", "What's the total? Hundred and twenty rupees. Okay, thank you!"),
    ],
    "kn-243": [
        ("Ramu looks outside. It's raining heavily. The wind is strong.", "There's a lot of rain! Wind."),
        ("Lakshmi makes tea. She tells Ramu to drink.", "It's become cold, drink hot tea."),
        ("Ramu takes the tea and compliments it. Lakshmi talks about the rain.", "Very good! Bengaluru rain is very nice."),
        ("Ramu compares it to Delhi's heat.", "In Delhi the heat is too much. Bengaluru weather is nice."),
        ("Lakshmi says the rain has become heavy but will stop soon.", "The rain has become heavy. It'll stop in a little while."),
        ("Ramu says he's happy with the rain, tea, and company.", "I'm happy. Rain, hot tea, and good company. You're a very good boy!"),
    ],
    "kn-244": [
        ("Ramu walks into Meera's restaurant. She greets him.", "Hello Ramu! What do you want today?"),
        ("Ramu wants a full meal. Meera lists the dishes.", "Today I want a meal. Okay! Rice, rasam, sambar, vegetable dish, curd."),
        ("Ramu asks what one of the dishes is. Meera explains.", "What is rasam? Rasam is a thin spicy soup. Sambar."),
        ("Ramu tries the food and likes it.", "The rice is very good! The rasam is hot."),
        ("Meera offers curd. Ramu also asks for water.", "Want curd? Yes, give a little curd. And give water."),
        ("Meera asks about drinks. Ramu chooses coffee.", "Want hot coffee or tea? Don't want tea, give coffee."),
        ("Ramu finishes and compliments the food. He'll come back tomorrow.", "Meera, your food is very good! I'll come tomorrow too."),
    ],
    "kn-245": [
        ("Priya suggests a trip to Mysuru. Ramu loves the idea.", "Ramu, let's go to Mysuru tomorrow! Very good idea!"),
        ("At the bus stand, Ramu asks about the bus.", "When is the bus to Mysuru? In five minutes."),
        ("Ramu asks about the ticket price.", "How much is the ticket? Two tickets, three hundred rupees."),
        ("On the bus, Ramu asks if Mysuru is far.", "Is Mysuru far? A little far. It'll take three hours."),
        ("The bus is slow. Ramu comments. Priya is relaxed.", "The bus is very slow! No problem!"),
        ("They arrive in Mysuru. Ramu is impressed.", "Mysuru has arrived! Very beautiful!"),
        ("Priya points to the palace ahead.", "The palace is ahead. Let's go!"),
        ("At the end of the day, Ramu reflects on a great day.", "Today was a very good day! I'm happy. Me too!"),
    ],
}

# Apply to JSON
with open('data/learn_kannada.json') as f:
    tasks = json.load(f)

applied = 0
for task in tasks:
    tid = task['id']
    if tid not in NARRATOR_SCRIPTS:
        continue
    scripts = NARRATOR_SCRIPTS[tid]
    segments = task['reference']['segments']
    if len(scripts) != len(segments):
        print(f'WARNING: {tid} has {len(segments)} segments but {len(scripts)} scripts')
        continue
    for seg, (before, after) in zip(segments, scripts):
        seg['narrator_before'] = before
        seg['narrator_after'] = after
        applied += 1

with open('data/learn_kannada.json', 'w') as f:
    json.dump(tasks, f, indent=2, ensure_ascii=False)

print(f'Applied {applied} narrator scripts to {len(NARRATOR_SCRIPTS)} tasks')
