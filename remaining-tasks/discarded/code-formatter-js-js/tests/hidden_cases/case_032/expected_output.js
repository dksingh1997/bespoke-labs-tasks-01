module = await import(`data:text/javascript,
    console.log("RAN");
`);

module = await import(String.raw`data:text/javascript,
    console.log("RAN");
`);
