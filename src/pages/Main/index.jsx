import { useState, useCallback, useEffect } from 'react'
import { Container, Form, SubmitButton, List, DeleteButton } from './styles'
import { FaGithub, FaPlus, FaSpinner, FaBars, FaTrash } from 'react-icons/fa'

import api from '../../services/api'
import { Link } from 'react-router-dom/cjs/react-router-dom.min'

export default function Main() {
  const [newRepo, setNewRepo] = useState('')
  const [repositorios, setRepositorios] = useState([])
  const [loading, setLoading] = useState(false) //habilite assim que clicar no botão
  const [alert, setAlert] = useState(null)


  //2Buscar
  useEffect(() => {
    const repoStorage = localStorage.getItem('repos')

    if(repoStorage) {
      setRepositorios(JSON.parse(repoStorage))
    }
  }, [])








  //1Salvar alterações
  useEffect(() => {
    localStorage.setItem('repos', JSON.stringify(repositorios))
  }, [repositorios])









  //clicou no handleSubmit, chamau o submit(), habilita o loading, vai tentar fazer a requisição, e ao acabar, o setLoading vira false 
  const handleSubmit = useCallback((e) => {
    e.preventDefault()

    async function submit() {
      setLoading(true)
      setAlert(null)
      try {

        if(newRepo === '') {
          throw new Error('Você precisa indicar um repositorio!')
        }

        const response = await api.get(`repos/${newRepo}`) //buscar o que pesquisar
      
        const hasRepo = repositorios.find(repo => repo.name === newRepo) //verificar se tem um repo igual já ao que acabo de digitar

        if(hasRepo) {
          throw new Error('Repositorio duplicado!')
        }

        const data = {
          name: response.data.full_name,
        }
    
        setRepositorios([...repositorios, data]) //pegando oq ja tem, e add + o data
        setNewRepo('')
      }catch(error) {
        setAlert(true)
        console.log(error)
      }finally {
        setLoading(false)
      }

    }

    submit()
  }, [newRepo, repositorios]) //quando uma ou outra state for atualizada, vai chmar o useCallback








  //ao digitar
  function handleInputChange(e) {
    setNewRepo(e.target.value)
    setAlert(null)
  }






  //na repo ta recebendo o nome
  const handleDelete = useCallback((repo) => {
    //vai filtrar todos os repositorios e só vai devolver pra const find, todos os repos diferentes da que eu cliquei
    const find = repositorios.filter(r => r.name !== repo)
    setRepositorios(find)
  }, [repositorios])




  return (
    <Container>

      <h1>
        <FaGithub size={25}/>
        Meus repositorios
      </h1>

      <Form onSubmit={handleSubmit} error={alert}>
        <input type="text"
        placeholder='Adicionar Repositorios'
        value={newRepo}
        onChange={handleInputChange}
        />

        <SubmitButton loading={loading ? 1 : 0}>
          {loading ? (
            <FaSpinner color='#fff' size={14} />
          ) : (
            <FaPlus color='#FFF' size={14} />
          )}
        </SubmitButton>

      </Form>

      <List>
            {repositorios.map(repo => (
              <li key={repo.name}>
                <span>
                {/* oq eu quero deletar (repo.name) */}
                <DeleteButton onClick={() => handleDelete(repo.name)}>
                  <FaTrash size={14}/>
                </DeleteButton>
                {repo.name}
                </span>
                <Link to={`/repositorio/${encodeURIComponent(repo.name)}`}>
                  <FaBars size={20}/>
                </Link>
              </li>
            ))}
      </List>

    </Container>
  )
}