BarBack 

- The mobile app is the open source/gimmick; showcase the vision identification in the app and make that free
- The integration with backend software/stock systems/spreadsheets is where we make money
- Fixed camera installs can run at specific intervals without the user/bar staff having to take out their phones
    - Need to make sure identification can be made at a distance/scale for that to work


MVP
- Photo identification one at a time
    - Get what we can out of each image and put it in a JSON format
    - Give the user a chance to make corrections or add data
    - Probably batch processing for ease
- Variety of bottles to train on
- Seeded UN/PW data
- Bar name
- New inventory check - auto to date of check
    - Slider next to bottle for close accuracy for fill level
- SAM 3 (segment anything model) - will be able to specify object in the photo
    - Works with video (stretch)
- YOLO as well 
    - Could work for obscure bottles (stretch)
- Graph/viz screen to show their inventory
- Export to spreadsheet 
- Post MVP - does an agent place an order?
- Email notification before auto-order (stretch)
- Set order warnings when inventory low to order again
- Inventory data model
    - Make
    - Model
    - Vintage
    - SKU
    - Volume


Research
- Where to get SKUs - UPC/GTIN-12 👈 this is the important one
- Is there a bottle db (image and data)
