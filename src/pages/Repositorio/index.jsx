import { Container, Owner, Loading, BackButton, IssuesList, PageActions, FilterList } from "./styles";
import { FaArrowLeft } from 'react-icons/fa'
import { useState, useEffect } from "react";
import api from '../../services/api'




export default function Repositorio({match}) {
  const [repositorio, setRepositorio] = useState({})
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState([ //filtros dos botões, pegando o state de cada
    {state: 'all', label: 'Todas', active: true},
    {state: 'open', label: 'Abertas', active: false},
    {state: 'closed', label: 'Fechadas', active: false},
  ])
  const [filterIndex, setFilterIndex] = useState(0) //saber a posição ativada



  useEffect(() => {

    async function load() {
      const nomeRepo = decodeURIComponent(match.params.repositorio)

      //pegando as infos da api e armazenando nas constantes
      const [repositorioData, issuesData] =  await Promise.all([
        api.get(`/repos/${nomeRepo}`),
        api.get(`/repos/${nomeRepo}/issues`, {
          params: {
            state: filters.find(f => f.active).state, //pegando o filtro ativo (true)
            per_page: 5
          }
        })
      ])

      setRepositorio(repositorioData.data)
      setIssues(issuesData.data)
      setLoading(false)
    }

    load()
  }, [filters, match.params.repositorio])





  //2renderizar novamente a lista nas paginas (page)
  useEffect(() => {

    async function loadIssue() {
      const nomeRepo = decodeURIComponent(match.params.repositorio)

      const response = await api.get(`/repos/${nomeRepo}/issues`, {
        params: {
          state: filters[filterIndex].state, //pegando o filtro ativo (true) 0, 1, 2
          page,
          per_page: 5,
        }
      })

      setIssues(response.data)
    }

    loadIssue()
  }, [filterIndex, filters, match.params.repositorio, page])







  //1se for back volta, se não passa
  function handlePage(action) {
    setPage(action === 'back' ? page - 1 : page + 2)
  }







  function handleFilter(index) {
    setFilterIndex(index)
  }




  if(loading) {
    return (
      <Loading>
        <h1>Carregando...</h1>
      </Loading>
    )
  }



  return (
    <Container>
      <BackButton to="/">
        <FaArrowLeft color="#000" size={30}/>
      </BackButton>



      <Owner>
        <img src={repositorio.owner.avatar_url} alt={repositorio.owner.login} />
        <h1>{repositorio.name}</h1>
        <p>{repositorio.description}</p>
      </Owner>



      <FilterList active={filterIndex}>
        {filters.map((filter, index) => (
          <button
          key={filter.label}
          type="button"
          onClick={() => handleFilter(index)} //clica passando o index da posição do objeto (0, 1, 2)
          >
            {filter.label}
          </button>
        ))}
      </FilterList>



      <IssuesList>
        {issues.map((issue) => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />

            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>

                {issue.labels.map(label => (
                  <span key={String(label.id)}>{label.name}</span>
                ))}

              </strong>

                <p>{issue.user.login}</p>

            </div>
          </li>
        ))}
      </IssuesList>



        <PageActions>
          <button type="button" onClick={() => handlePage('back')} disabled={page < 2} >Voltar</button>
          <button type="button" onClick={() => handlePage('next')}>Próximo</button>
        </PageActions>

    </Container>
  )
}