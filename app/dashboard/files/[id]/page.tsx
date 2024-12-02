export default async function FileChat({params}: {params: {id: string}}) {
    const { id } = await Promise.resolve(params);
    
    return (
      <div>
        {id}
      </div>
    )
  }