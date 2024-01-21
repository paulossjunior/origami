import fetch from 'node-fetch';
export class Util {

    public static convertDateFormat(inputDate) {
        // Split the input date string into day, month, and year
        const [day, month, year] = inputDate.split('/');
      
        // Create a new Date object with the given values
       return  `${year}-${month}-${day}T00:00:00.000+00:00`;
      
               
      }
    public static async send (URL: string, email:string, apitoken:string, data: any){
        try{
            const response = await fetch(`${URL}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${Buffer.from(`${email}:${apitoken}`).toString('base64')}`,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: data
              })
            
            
            if (!response.ok) {
                const message = await response.json()
                
                throw new Error(`HTTP error! Status: ${response.status}-${JSON.stringify(message)}`);
            }
                               
            return await response.json();

        }catch (error) {
            throw new Error(`Error fetching data: ${error.message}`);
          }
        
    }
}