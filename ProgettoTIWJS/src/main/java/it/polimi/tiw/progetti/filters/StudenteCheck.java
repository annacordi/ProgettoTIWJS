package it.polimi.tiw.progetti.filters;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

import it.polimi.tiw.progetti.beans.User;

/**
 * Servlet Filter implementation class StudenteChecker
 */
public class StudenteCheck implements Filter {
       
    /**
     * @see HttpFilter#HttpFilter()
     */
    public StudenteCheck() {
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see Filter#destroy()
	 */
	public void destroy() {
		// TODO Auto-generated method stub
	}

	/**
	 * @see Filter#doFilter(ServletRequest, ServletResponse, FilterChain)
	 */
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

		System.out.print("Studente filter executing \n");
		HttpServletRequest req = (HttpServletRequest) request;
		HttpServletResponse res = (HttpServletResponse) response;
		String loginpath = req.getServletContext().getContextPath() + "/loginPage.html";

		HttpSession s = req.getSession();
		User u = null;
        // check if the client is a worker
		u = (User) s.getAttribute("user");
		if(u==null) {
			System.out.print("StudenteUser è vuoto\n");
			//res.setStatus(HttpServletResponse.SC_FORBIDDEN);
			res.sendRedirect(loginpath);
			//s.invalidate();
			return;

		
		}
		System.out.print("Il ruolo è " + u.getRole() +"\n");
		if (!u.getRole().equals("studente")) {
			
            //System.out.println("Redirecting to login - invalid role");
            //res.setStatus(HttpServletResponse.SC_FORBIDDEN);
            res.sendRedirect(loginpath);
			//s.invalidate();
			return;
		}

		// pass the request along the filter chain
		chain.doFilter(request, response);
	}

	/**
	 * @see Filter#init(FilterConfig)
	 */
	public void init(FilterConfig fConfig) throws ServletException {
		// TODO Auto-generated method stub
	}

}
