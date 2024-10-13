---
title: "How the Query Planner Works"
date: 2024-09-19T09:33:48+04:00
draft: true
toc: false
images:
tags:
  - untagged
--


Docs Notes (read again):

analyze uses random samplling while producing stats
use EXPLAIN command to see what query plan the planner usees for the query

- a query plan consists of plan nodes
  - nodes at the bottom level are scan nodes -> return rows from table
  - there are diff types of sscan nodes for diff table access methods (sequendial, index, bimap, bitmap index)
  - there's also non-table row sources such as VALUES clauses and set-returning functions in FROM that have own scan node types
  - if joins/aggs/sorts/other ops on raw rows, additional nodes above scan nodes to perform them
  - explain has 1 line for each node in plan tree (node type + cost estimates + total exec cost)
    - additional lines indented w/ additional properties of the node
  - costs measured in arbitrary units (seq_page_cost, random_page_cost) determined by the planners cost parameters. traditional practice measure costs in units of disk page fetches
  - cost of upper level node includes costs of all child nodes
  - cost only includes things the planner cares about (- time to send result to client, -)
  - *rows* value = number of rows emitted by the ndoe, often less than number scanned as result of filtering by WHEREs applied at the node. Ideally, top level row estimate is approximation of actual rows returned/updated/deleted


single column stats
  - pg_class reltuples and relpages store number of tuples and pages respectively
    - not updated on the fly. updated by vacuum, analyze and few ddl commands such as create index. vacuum/analyze do no scan whole table and incrementaly update reltuples on the bases of the part of the table it did scan (results in approx value) 
  - planner makes estimate of selectivity of WHEREs and stores in pg_statistic system catalog. entries in this table updated by analyze/vacuum analyze and always approx even when fresh
  - when examining stats manually use pg_stats (more easy to read), only show tables that current user can read
  - amount of info stored in pg-statistic, in particular max num of entries in most_common_vals and histogram_bounds for each column, can be se on a column-by-column basis usingi ALTER TABLE SET STATISTICS, or globally using default_statistics_target config value. default 100. raising limit allow more accurate planner estimates (especially for columns with irregular data distributions) at cost of consuming more stace in pg_statistic and slightly more time to compute the estimates. 


multivariate stats:


MCVs:


Bruce Momjiam talk notes (watch again) https://www.youtube.com/watch?v=RNDTO33hVtY:

 - optimizer brain of the database
 - query execution steps
  - parse statement
  - traffic cop (is it a query or utility command?)
  - rewrite query (handles things like views and rules)
  - generates a number of paths and chooses the cheapest
  - generate a plan
  - execute a plan

- decisions optimizer has to make
  - scan method
   - sequential, bitmap, index
  - join method
  - join order

- run analyze manually on manually created table with fresh data

Access methods
- sequential scans: very common values
- bitmap heap scans: not common, not rare values
- index scans: few values

- the reason relational systems are popular is that they take all the guess work about what kind of scan and join method to use and delegate this to the optimizer + stats, especially for complex models. it takes this problems off of the application and move it to the data layer


Join methods
  - nested loop [tight restriction "sample1.id = sample2.id and sample1.id = 33]
    - nested loop w/ inner seq scan
    - nested loop w/ inner index scan
  - hash join [loose restriction "sample1.id = sample2.id and sample1.id > 33], 
  - merge join ideal for large tables [no restriction]
    - needs sorting intermediate sets

  
  LIMIT can affect join usage
    without LIMIT hash is used for unrestricted


