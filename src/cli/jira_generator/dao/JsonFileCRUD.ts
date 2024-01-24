import fs from "fs";

export class JsonFileCRUD {
    
  filePath:string

    constructor(filePath) {
      this.filePath = filePath;
      this.createFileIfNotExists();
    }
  
    public append(key, newData) {
      const data = this.read();
      if (!data[key]) {
        data[key] = newData;
      }else{
        Object.assign(data[key], newData);
      }
      
      this.write(data);
    }

    private createFileIfNotExists() {
      try {
        if (!fs.existsSync(this.filePath)) {
          const initialData = {};
          this.write(initialData);
        }
      } catch (error) {
        console.error('Error creating JSON file:', error.message);
      }
    }
    // Read data from the JSON file
    public read() {
      try {
        const data = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        console.error('Error reading JSON file:', error.message);
        return {};
      }
    }
  
    // Write data to the JSON file
    public write(data) {
      try {
        const json = JSON.stringify(data, null, 2);
        fs.writeFileSync(this.filePath, json, 'utf8');
        console.log('Data written to JSON file successfully.');
      } catch (error) {
        console.error('Error writing to JSON file:', error.message);
      }
    }
  
    // Create a new record in the JSON file
    public create(key, value:any) {
      const data = this.read();
      data[key] = value;
      this.append(key,value);
    }
  
    // Read all records from the JSON file
    public readAll() {
      return this.read();
    }
  
    // Read a specific record by its key
    public readByKey(key:string) {
      const data = this.read();
      return data[key];
    }
  
    // Update a record in the JSON file
    public update(key:string, updatedValue:any) {
      const data = this.read();
      data[key] = updatedValue;
      this.write(data);
    }
  
    // Delete a record from the JSON file
    public delete(key:string ) {
      const data = this.read();
      delete data[key];
      this.write(data);
    }
  }